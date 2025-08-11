# 🚀 RSVP Hub - Quick Start Guide

Get your RSVP event management system up and running in minutes!

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Development Servers
```bash
npm run dev
```

This will start both the backend server and frontend client concurrently.

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5010
- **Health Check**: http://localhost:5010/api/health

## 🔧 Available Scripts

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run server:dev` - Start only the backend server with nodemon
- `npm run client:dev` - Start only the frontend React app

### Production
- `npm run server:start` - Start production server
- `npm run client:build` - Build frontend for production

### Testing
- `npm test` - Run frontend tests
- `npm run test:server` - Run backend tests

### Code Quality
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix code quality issues automatically

## 🗄️ Database

The application automatically creates a SQLite database at `server/data/rsvp.db` on first run.

## 🔐 Default Admin User

A default admin user is created automatically:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change this password in production!

## 📁 Project Structure

```
rsvp site/
├── client/          # React frontend
├── server/          # Node.js backend
├── README.md        # Detailed documentation
└── QUICKSTART.md    # This file
```

## 🚨 Troubleshooting

### Port Already in Use
If you get port conflicts:
- Frontend (3000): Kill any existing React dev servers
- Backend (5010): Kill any existing Node processes

### Database Issues
- Delete `server/data/rsvp.db` to reset the database
- Check that the `server/data/` directory exists

### Dependencies Issues
- Run `npm run install:all` to reinstall all dependencies
- Clear npm cache: `npm cache clean --force`

## 🔗 Next Steps

1. **Create Events**: Use the default admin account to create your first event
2. **Invite Guests**: Share event links with your guests
3. **Customize**: Modify the code to fit your specific needs
4. **Deploy**: Follow the deployment guide in README.md

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the code structure and comments
- Open an issue if you encounter problems

---

**Happy Event Planning! 🎉**
