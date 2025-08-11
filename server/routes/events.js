const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('./auth');
const { createEventFolder, updateEventData } = require('../services/gitService');

const router = express.Router();

// Create new event
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 1000 }).trim().escape(),
  body('event_date').isISO8601().toDate(),
  body('location').optional().isLength({ max: 200 }).trim().escape(),
  body('max_attendees').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, event_date, location, max_attendees } = req.body;
    const db = getDatabase();

    db.run(`
      INSERT INTO events (title, description, event_date, location, max_attendees, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, event_date, location, max_attendees, req.user.userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create event' });
      }

      const eventId = this.lastID;

      // Create Git folder for the event
      createEventFolder(eventId, title)
        .then(() => {
          res.status(201).json({
            message: 'Event created successfully',
            event: {
              id: eventId,
              title,
              description,
              event_date,
              location,
              max_attendees,
              created_by: req.user.userId,
              status: 'active'
            }
          });
        })
        .catch(gitError => {
          console.error('Git folder creation error:', gitError);
          // Event was created in DB, but Git folder failed
          res.status(201).json({
            message: 'Event created successfully (Git folder creation pending)',
            event: {
              id: eventId,
              title,
              description,
              event_date,
              location,
              max_attendees,
              created_by: req.user.userId,
              status: 'active'
            }
          });
        });
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (status) {
      whereClause += ' WHERE status = ?';
      params.push(status);
    }

    if (search) {
      const searchWhere = whereClause ? ' AND' : ' WHERE';
      whereClause += `${searchWhere} (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    db.get(`SELECT COUNT(*) as total FROM events${whereClause}`, params, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const total = countResult.total;

      // Get events with pagination
      db.all(`
        SELECT e.*, u.username as creator_name,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'confirmed') as confirmed_count,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id) as total_rsvps
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ${whereClause}
        ORDER BY e.event_date ASC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset], (err, events) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    db.get(`
      SELECT e.*, u.username as creator_name,
             (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'confirmed') as confirmed_count,
             (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id) as total_rsvps
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ event });
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 1000 }).trim().escape(),
  body('event_date').optional().isISO8601().toDate(),
  body('location').optional().isLength({ max: 200 }).trim().escape(),
  body('max_attendees').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['active', 'cancelled', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if user owns the event or is admin
    db.get('SELECT created_by FROM events WHERE id = ?', [id], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.created_by !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this event' });
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      db.run(`UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`, updateValues, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update event' });
        }

        res.json({ message: 'Event updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if user owns the event or is admin
    db.get('SELECT created_by FROM events WHERE id = ?', [id], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.created_by !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this event' });
      }

      // Soft delete by setting status to cancelled
      db.run('UPDATE events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        ['cancelled', id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete event' });
          }

          res.json({ message: 'Event deleted successfully' });
        });
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events created by current user
router.get('/my-events', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    db.get('SELECT COUNT(*) as total FROM events WHERE created_by = ?', [req.user.userId], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const total = countResult.total;

      db.all(`
        SELECT e.*,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'confirmed') as confirmed_count,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id) as total_rsvps
        FROM events e
        WHERE e.created_by = ?
        ORDER BY e.event_date ASC
        LIMIT ? OFFSET ?
      `, [req.user.userId, limit, offset], (err, events) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
