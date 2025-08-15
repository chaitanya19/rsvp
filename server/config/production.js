module.exports = {
  port: process.env.PORT || 5000,
  environment: 'production',
  database: {
    path: process.env.DATABASE_PATH || './data/rsvp.db'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  git: {
    repoPath: process.env.GIT_REPO_PATH || './rsvp-data',
    user: {
      name: process.env.GIT_USER_NAME || 'RSVP System',
      email: process.env.GIT_USER_EMAIL || 'rsvp@system.com'
    }
  }
};
