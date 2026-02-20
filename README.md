# DoodleSync

Collaborative online whiteboard and chat app for teams, classrooms, and friends. Draw, brainstorm, and chat in real time with room-based presence, collaborative cursors, and admin controls.

## ✨ Features

### 🎨 Whiteboard & Collaboration
- **Infinite Whiteboard**: Draw, sketch, and plan together using Tldraw
- **Collaborative Cursors**: See other users' cursor movements in real-time with colored name labels
- **Real-time Sync**: All drawing changes sync instantly across all connected users
- **Template Gallery**: Choose from pre-designed templates for brainstorming, planning, design, and more

### 💬 Communication
- **Real-time Chat**: Integrated side chat with live message history
- **Chat Persistence**: Messages saved to MongoDB and loaded on room join
- **System Messages**: Automatic notifications when users join/leave rooms
- **Presence & Activity**: See who's online, who's drawing, and who's typing

### 🚪 Room Management
- **Public/Private Rooms**: Create public or private rooms with custom IDs
- **Copy Room ID**: One-click copy button to share room links with others
- **Leave Room**: Proper disconnect handling with notifications to other users
- **Admin Controls**: Private room creators become admins

### 🔐 Authentication & Security
- **Email Authentication**: Sign up with email and password
- **OTP Verification**: Secure two-factor login with 6-digit OTP codes
- **Password Reset**: Email-based password recovery with OTP verification
- **Google OAuth**: Quick sign-in with Google account
- **Guest Mode**: Join rooms without signing up
- **Welcome Emails**: Automated welcome message on first signup

### 🎨 UI/UX
- **Modern Design**: Beautiful gradient designs and smooth animations
- **Dark Mode Support**: Seamless dark/light theme transitions
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Help Center**: Comprehensive guides, FAQs, and keyboard shortcuts

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)
- **Gmail Account** (for SMTP email features)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Shivansh1251/DoodleSync.git
   cd DoodleSync
   ```

2. **Install backend dependencies**
   ```sh
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```sh
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/doodlesync
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/doodlesync

# JWT Secret (generate a random secure string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail SMTP)
EMAIL_USER=doodlesync@gmail.com
EMAIL_PASSWORD=your-gmail-app-password-here
EMAIL_FROM=DoodleSync <doodlesync@gmail.com>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Setting up Gmail SMTP:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate an [App Password](https://myaccount.google.com/apppasswords)
4. Use the app password as `EMAIL_PASSWORD`

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_SERVER_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```sh
   mongod
   ```

2. **Start the backend server**
   ```sh
   cd backend
   npm run dev
   # or
   node server.js
   ```

3. **Start the frontend development server**
   ```sh
   cd frontend
   npm run dev
   ```

4. **Open in browser**
   - Visit [http://localhost:5173](http://localhost:5173)

## 📖 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email/password or Google OAuth
2. **OTP Login**: Enable two-factor authentication for secure access
3. **Create Room**: Choose to create a public or private room
4. **Invite Others**: Use the "Copy Room ID" button to share with collaborators

### Whiteboard Features
- **Draw Tools**: Access full Tldraw drawing toolkit
- **Collaborative Cursors**: See where other users are pointing in real-time
- **Real-time Sync**: All changes sync automatically

### Chat Features
- **Send Messages**: Use the integrated chat panel on the right
- **View History**: All messages are saved and loaded when you rejoin
- **System Notifications**: See when users join or leave

### Room Management
- **Leave Room**: Click the "Leave Room" button to properly disconnect
- **Share Room**: Use the copy icon next to the room ID to share with others
- **View Users**: See all online users in the presence panel

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tldraw** - Collaborative whiteboard library
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB** + **Mongoose** - Database and ODM
- **Nodemailer** - Email sending (SMTP)
- **JWT** - Token-based authentication
- **Passport.js** - OAuth authentication
- **bcrypt** - Password hashing

### Features
- **Collaborative Cursors** - Real-time cursor tracking with color-coded labels
- **Chat Persistence** - MongoDB-backed message history
- **Email System** - Welcome emails, OTP codes, password reset
- **Real-time Sync** - Document collaboration with conflict resolution

## 📂 Project Structure

```
DoodleSync/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema with OTP fields
│   │   ├── Room.js              # Room schema
│   │   └── ChatMessage.js       # Chat message schema
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── utils/
│   │   ├── emailService.js      # Email sending functions
│   │   └── DatabaseService.js   # DB helper functions
│   ├── server.js                # Main server + Socket.IO
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── BasicExample.jsx       # Main whiteboard room
│   │   │   ├── Whiteboard.jsx         # Alternative whiteboard
│   │   │   ├── SideChat.jsx           # Chat panel component
│   │   │   ├── OnlineUsers.jsx        # User presence component
│   │   │   ├── ConnectionStatus.jsx   # Socket status indicator
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Loginpage.jsx          # Login with OTP
│   │   │   ├── Signup.jsx             # Registration
│   │   │   ├── ForgotPassword.jsx     # Password reset flow
│   │   │   ├── RoomEntry.jsx          # Room selection
│   │   │   └── Chat.jsx               # Standalone chat
│   │   ├── utils/
│   │   │   ├── ApiService.js          # API calls
│   │   │   └── AuthService.js         # Auth helper functions
│   │   ├── context/
│   │   │   └── ThemeContext.jsx       # Dark mode context
│   │   ├── App.jsx                    # Main app routes
│   │   └── main.jsx                   # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Traditional login
- `POST /api/auth/login/request-otp` - Request OTP for login
- `POST /api/auth/login/verify-otp` - Verify OTP and login
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/guest` - Create guest session

### Rooms
- `GET /api/rooms` - List public rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details

## 🔌 Socket.IO Events

### Client → Server
- `join-room` - Join a specific room
- `leave-room` - Leave room with notifications
- `doc-update` - Send whiteboard changes
- `chat-message` - Send chat message
- `cursor-move` - Send cursor position (throttled)
- `activity` - Send user activity status

### Server → Client
- `doc-init` - Receive initial document state
- `doc-update` - Receive document changes
- `chat-history` - Receive message history on join
- `chat-message` - Receive new chat messages
- `cursor-update` - Receive other users' cursor positions
- `presence-update` - User joined/left notifications
- `user-activity` - User activity updates

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test features thoroughly before submitting
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Shivansh1251**
- GitHub: [@Shivansh1251](https://github.com/Shivansh1251)

## 🙏 Acknowledgments

- [Tldraw](https://tldraw.dev/) - Excellent whiteboard library
- [Socket.IO](https://socket.io/) - Real-time communication
- [MongoDB](https://www.mongodb.com/) - Database platform
- [React](https://react.dev/) - UI framework

---

Made with ❤️ by Shivansh1251

**⭐ Star this repo if you find it useful!**