const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../data/rsvp.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          event_date DATETIME NOT NULL,
          location TEXT,
          max_attendees INTEGER,
          created_by INTEGER,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create rsvps table
      db.run(`
        CREATE TABLE IF NOT EXISTS rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          dietary_restrictions TEXT,
          plus_one BOOLEAN DEFAULT FALSE,
          plus_one_name TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(event_id, user_id)
        )
      `);

      // Create event_guests table for non-registered users
      db.run(`
        CREATE TABLE IF NOT EXISTS event_guests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          status TEXT DEFAULT 'confirmed',
          dietary_restrictions TEXT,
          plus_one BOOLEAN DEFAULT FALSE,
          plus_one_name TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events (id)
        )
      `);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)');
      db.run('CREATE INDEX IF NOT EXISTS idx_rsvps_event ON rsvps(event_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_rsvps_user ON rsvps(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_event_guests_event ON event_guests(event_id)');

      // Create default admin user if it doesn't exist
      db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err);
        } else if (!row) {
          const defaultPassword = 'admin123'; // Change this in production!
          bcrypt.hash(defaultPassword, 10, (err, hash) => {
            if (err) {
              console.error('Error hashing admin password:', err);
            } else {
              db.run(`
                INSERT INTO users (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
              `, ['admin', 'admin@rsvp.com', hash, 'admin'], (err) => {
                if (err) {
                  console.error('Error creating admin user:', err);
                } else {
                  console.log('✅ Default admin user created (username: admin, password: admin123)');
                }
              });
            }
          });
        }
      });

      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('✅ Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

function getDatabase() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initializeDatabase,
  getDatabase
};
