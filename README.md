# DoodleSync

Collaborative online whiteboard and chat app for teams, classrooms, and friends. Draw, brainstorm, and chat in real time with collaborative cursors and room-based features.

## ✨ Key Features

- **Infinite Whiteboard** with Tldraw - Draw, sketch, and plan together
- **Collaborative Cursors** - See other users' real-time cursor movements with colored labels
- **Real-time Chat** - Persistent chat with MongoDB storage and message history
- **OTP Authentication** - Secure 2FA login with 6-digit codes
- **Email System** - Welcome emails, login OTPs, password reset
- **Public/Private Rooms** - Create rooms and share via copy-to-clipboard room IDs
- **User Presence** - See who's online, drawing, and typing
- **Dark Mode** - Seamless theme switching
- **Google OAuth** - Quick sign-in option

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account (for email features)

### Installation & Setup

```sh
# Clone repository
git clone https://github.com/Shivansh1251/DoodleSync.git
cd DoodleSync

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure backend/.env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/doodlesync
JWT_SECRET=your-secret-key
EMAIL_USER=doodlesync@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
CLIENT_URL=http://localhost:5173

# Configure frontend/.env
VITE_SERVER_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
# Optional in production: used for canonical and social metadata
VITE_SITE_URL=https://your-production-domain.example

# Start servers
cd backend && npm run dev
cd frontend && npm run dev

# Open browser
http://localhost:5173
```

**Gmail Setup:** Enable 2FA → Generate [App Password](https://myaccount.google.com/apppasswords) → Use as `EMAIL_PASSWORD`

## 🛠️ Tech Stack

**Frontend:** React 18 • Vite • Tldraw • Socket.IO Client • Tailwind CSS  
**Backend:** Node.js • Express • Socket.IO • MongoDB • Mongoose • Nodemailer • JWT • Passport.js

## 📖 Usage

1. **Sign Up** with email/password or Google OAuth
2. **Create Room** - Choose public or private
3. **Share Room** - Click copy icon next to room ID
4. **Collaborate** - Draw together and see real-time cursors
5. **Chat** - Messages persist across sessions
6. **Leave** - Click "Leave Room" to disconnect properly

## 🔌 Key Socket Events

**Client → Server:** `join-room`, `leave-room`, `doc-update`, `chat-message`, `cursor-move`  
**Server → Client:** `doc-init`, `chat-history`, `chat-message`, `cursor-update`, `presence-update`

## 📂 Project Structure

```
DoodleSync/
├── backend/
│   ├── models/        # User, Room, ChatMessage schemas
│   ├── routes/        # Auth routes
│   ├── utils/         # Email service, DB helpers
│   └── server.js      # Main server + Socket.IO
├── frontend/
│   ├── src/
│   │   ├── Components/  # Whiteboard, Chat, User presence
│   │   ├── pages/       # Home, Login, Signup, Room entry
│   │   └── utils/       # API & Auth services
│   └── vite.config.js
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License

---

Made with ❤️ by [Shivansh1251](https://github.com/Shivansh1251)

**⭐ Star this repo if you find it useful!**
