const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('./auth');
const { updateEventData } = require('../services/gitService');

const router = express.Router();

// Submit RSVP for registered user
router.post('/submit', authenticateToken, [
  body('event_id').isInt({ min: 1 }),
  body('status').isIn(['confirmed', 'declined', 'pending']),
  body('dietary_restrictions').optional().isLength({ max: 500 }).trim().escape(),
  body('plus_one').optional().isBoolean(),
  body('plus_one_name').optional().isLength({ max: 100 }).trim().escape(),
  body('notes').optional().isLength({ max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, status, dietary_restrictions, plus_one, plus_one_name, notes } = req.body;
    const db = getDatabase();

    // Check if event exists and is active
    db.get('SELECT id, title, status FROM events WHERE id = ?', [event_id], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'active') {
        return res.status(400).json({ error: 'Event is not active' });
      }

      // Check if user already has an RSVP for this event
      db.get('SELECT id FROM rsvps WHERE event_id = ? AND user_id = ?', [event_id, req.user.userId], (err, existingRsvp) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingRsvp) {
          // Update existing RSVP
          db.run(`
            UPDATE rsvps 
            SET status = ?, dietary_restrictions = ?, plus_one = ?, plus_one_name = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE event_id = ? AND user_id = ?
          `, [status, dietary_restrictions, plus_one || false, plus_one_name, notes, event_id, req.user.userId], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update RSVP' });
            }

            // Update Git repository
            updateEventDataInGit(event_id, event.title);
            res.json({ message: 'RSVP updated successfully' });
          });
        } else {
          // Create new RSVP
          db.run(`
            INSERT INTO rsvps (event_id, user_id, status, dietary_restrictions, plus_one, plus_one_name, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [event_id, req.user.userId, status, dietary_restrictions, plus_one || false, plus_one_name, notes], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to submit RSVP' });
            }

            // Update Git repository
            updateEventDataInGit(event_id, event.title);
            res.status(201).json({ message: 'RSVP submitted successfully' });
          });
        }
      });
    });
  } catch (error) {
    console.error('Submit RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit RSVP for guest (non-registered user)
router.post('/guest', [
  body('event_id').isInt({ min: 1 }),
  body('name').isLength({ min: 1, max: 100 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isLength({ max: 20 }).trim().escape(),
  body('status').isIn(['confirmed', 'declined', 'pending']),
  body('dietary_restrictions').optional().isLength({ max: 500 }).trim().escape(),
  body('plus_one').optional().isBoolean(),
  body('plus_one_name').optional().isLength({ max: 100 }).trim().escape(),
  body('notes').optional().isLength({ max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, name, email, phone, status, dietary_restrictions, plus_one, plus_one_name, notes } = req.body;
    const db = getDatabase();

    // Check if event exists and is active
    db.get('SELECT id, title, status FROM events WHERE id = ?', [event_id], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'active') {
        return res.status(400).json({ error: 'Event is not active' });
      }

      // Create guest RSVP
      db.run(`
        INSERT INTO event_guests (event_id, name, email, phone, status, dietary_restrictions, plus_one, plus_one_name, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [event_id, name, email, phone, status, dietary_restrictions, plus_one || false, plus_one_name, notes], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to submit guest RSVP' });
        }

        // Update Git repository
        updateEventDataInGit(event_id, event.title);
        res.status(201).json({ message: 'Guest RSVP submitted successfully' });
      });
    });
  } catch (error) {
    console.error('Submit guest RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get RSVP status for current user
router.get('/my-rsvps', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    db.get('SELECT COUNT(*) as total FROM rsvps WHERE user_id = ?', [req.user.userId], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const total = countResult.total;

      db.all(`
        SELECT r.*, e.title as event_title, e.event_date, e.location
        FROM rsvps r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        ORDER BY e.event_date ASC
        LIMIT ? OFFSET ?
      `, [req.user.userId, limit, offset], (err, rsvps) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          rsvps,
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
    console.error('Get my RSVPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all RSVPs for an event (event owner or admin only)
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const db = getDatabase();

    // Check if user owns the event or is admin
    db.get('SELECT created_by FROM events WHERE id = ?', [eventId], (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.created_by !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view RSVPs for this event' });
      }

      // Get registered user RSVPs
      db.all(`
        SELECT r.*, u.username, u.email
        FROM rsvps r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.created_at ASC
      `, [eventId], (err, userRsvps) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get guest RSVPs
        db.all(`
          SELECT * FROM event_guests
          WHERE event_id = ?
          ORDER BY created_at ASC
        `, [eventId], (err, guestRsvps) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Combine and format RSVPs
          const allRsvps = [
            ...userRsvps.map(rsvp => ({
              ...rsvp,
              type: 'registered_user',
              display_name: rsvp.username
            })),
            ...guestRsvps.map(rsvp => ({
              ...rsvp,
              type: 'guest',
              display_name: rsvp.name
            }))
          ];

          res.json({ rsvps: allRsvps });
        });
      });
    });
  } catch (error) {
    console.error('Get event RSVPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update RSVP status (event owner or admin only)
router.put('/:rsvpId', authenticateToken, [
  body('status').isIn(['confirmed', 'declined', 'pending']),
  body('notes').optional().isLength({ max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rsvpId } = req.params;
    const { status, notes } = req.body;
    const db = getDatabase();

    // Check if RSVP exists and user has permission
    db.get(`
      SELECT r.*, e.created_by, e.title
      FROM rsvps r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `, [rsvpId], (err, rsvp) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!rsvp) {
        return res.status(404).json({ error: 'RSVP not found' });
      }

      if (rsvp.created_by !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this RSVP' });
      }

      // Update RSVP
      db.run(`
        UPDATE rsvps 
        SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, notes, rsvpId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update RSVP' });
        }

        // Update Git repository
        updateEventDataInGit(rsvp.event_id, rsvp.title);
        res.json({ message: 'RSVP updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update Git repository
async function updateEventDataInGit(eventId, eventTitle) {
  try {
    const db = getDatabase();
    
    // Get all attendees for the event
    db.all(`
      SELECT 
        'registered_user' as type,
        u.username as name,
        u.email,
        r.status,
        r.dietary_restrictions,
        r.plus_one,
        r.plus_one_name,
        r.notes,
        r.created_at
      FROM rsvps r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
      
      UNION ALL
      
      SELECT 
        'guest' as type,
        name,
        email,
        status,
        dietary_restrictions,
        plus_one,
        plus_one_name,
        notes,
        created_at
      FROM event_guests
      WHERE event_id = ?
      
      ORDER BY created_at ASC
    `, [eventId, eventId], async (err, attendees) => {
      if (err) {
        console.error('Error fetching attendees for Git update:', err);
        return;
      }

      try {
        await updateEventData(eventId, eventTitle, attendees);
      } catch (gitError) {
        console.error('Git update error:', gitError);
      }
    });
  } catch (error) {
    console.error('Error in updateEventDataInGit:', error);
  }
}

module.exports = router;
