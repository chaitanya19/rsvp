# RSVP Hub - Event Management & RSVP System

A full-stack web application for managing events and RSVPs with a modern React frontend and Node.js backend.

## 🚀 Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Event Management**: Create, edit, and manage events
- **RSVP System**: Allow guests to RSVP with dietary restrictions and plus-one options
- **User Profiles**: Edit profile information and change passwords
- **Dashboard**: Overview of events and RSVPs
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Git Integration**: Track event changes in a Git repository

## 🏗️ Project Structure

```
rsvp site/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API route handlers
│   ├── database/          # Database initialization
│   ├── services/          # Business logic services
│   └── index.js           # Server entry point
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- React Hook Form
- React Hot Toast
- Axios

### Backend
- Node.js
- Express.js
- SQLite3
- JWT authentication
- bcryptjs (password hashing)
- Express Validator
- Helmet (security)
- CORS
- Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd rsvp-site
```

### 2. Install dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5010
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_PATH=./data/rsvp.db

# Git Repository Configuration
GIT_REPO_PATH=./events-repo
GIT_USER_NAME=RSVP Bot
GIT_USER_EMAIL=bot@rsvphub.com
```

### 4. Start the application

#### Start the backend server
```bash
cd server
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

#### Start the frontend (in a new terminal)
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5010

## 🗄️ Database

The application uses SQLite3 with the following main tables:
- `users` - User accounts and authentication
- `events` - Event information and details
- `rsvps` - RSVP responses from registered users
- `event_guests` - RSVP responses from non-registered users

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes for authenticated users
- Role-based access control (user/admin)

## 📱 Pages & Features

### Public Pages
- **Home** - Landing page with event showcase
- **Login** - User authentication
- **Register** - User registration
- **Event Detail** - Public event information

### Protected Pages
- **Dashboard** - User overview and statistics
- **Create Event** - Event creation form
- **My Events** - User's created events
- **Profile** - User profile management

## 🎨 UI Components

- **LoadingSpinner** - Reusable loading indicator
- **Navbar** - Navigation with user menu
- **Forms** - Consistent form styling with validation
- **Cards** - Event and RSVP display cards

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### RSVPs
- `POST /api/rsvp` - Create RSVP
- `GET /api/rsvp/event/:id` - Get event RSVPs
- `PUT /api/rsvp/:id` - Update RSVP
- `DELETE /api/rsvp/:id` - Cancel RSVP

## 🚀 Development

### Available Scripts

#### Frontend (client/)
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

#### Backend (server/)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Code Style
- ESLint configuration included
- Prettier formatting
- Consistent component structure
- Proper error handling

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- JWT token expiration
- Password hashing

## 📊 Performance

- Database indexing for faster queries
- Efficient SQL queries
- Client-side state management
- Optimized React components

## 🧪 Testing

The project includes testing setup with:
- Jest testing framework
- React Testing Library
- User event simulation

## 🚀 Deployment

### Frontend
- Build the React app: `npm run build`
- Deploy the `build` folder to your hosting service

### Backend
- Set `NODE_ENV=production`
- Use a process manager like PM2
- Set up environment variables
- Configure your database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Happy Event Planning! 🎉**
