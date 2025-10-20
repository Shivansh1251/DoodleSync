# DoodleSync Backend

This is the backend server for DoodleSync, a real-time collaborative whiteboard application with integrated chat functionality.

## Features

- Real-time collaborative drawing using Socket.IO
- Persistent data storage with MongoDB
- Chat history and message persistence
- Room management and document versioning
- User presence tracking
- RESTful API endpoints

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install MongoDB dependencies:
```bash
npm install mongoose dotenv nodemon
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if exists) or create a new `.env` file
   - Configure your MongoDB connection string:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/doodlesync
JWT_SECRET=your_jwt_secret_here
```

## MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: Start MongoDB as a service or run `mongod`
   - macOS: `brew services start mongodb/brew/mongodb-community`
   - Linux: `sudo systemctl start mongod`

### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update the `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doodlesync
```

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

## Database Models

### Room
- `roomId`: Unique identifier for each room
- `document`: The whiteboard document data
- `lastModified`: Last modification timestamp
- `createdBy`: User who created/last modified the room

### ChatMessage
- `roomId`: Associated room
- `message`: Message object with author, text, and timestamp
- `timestamps`: Creation and update times

### User
- `socketId`: Socket.IO connection ID
- `userId`: Unique user identifier
- `name`: Display name
- `email`: User email (optional)
- `lastActive`: Last activity timestamp
- `currentRoom`: Currently joined room

## API Endpoints

### GET `/api/rooms/:roomId`
Get room data and metadata.

### GET `/api/rooms/:roomId/chat`
Get chat history for a room.
- Query params: `limit` (default: 50)

### GET `/api/rooms`
Get list of all rooms (latest 20).

### DELETE `/api/rooms/:roomId`
Delete a room and its associated data.

## Socket.IO Events

### Client to Server
- `join-room`: Join a specific room
- `doc-update`: Send document updates
- `chat-message`: Send chat message
- `save-room`: Force save room to database

### Server to Client
- `doc-init`: Initial document state when joining
- `doc-update`: Document updates from other users
- `chat-message`: New chat message
- `chat-history`: Chat history when joining room
- `presence-update`: User join/leave notifications

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/doodlesync |
| `JWT_SECRET` | JWT secret for authentication | your_jwt_secret_here |

## Development

The server uses ES modules (`"type": "module"` in package.json), so use `import/export` syntax.

### Project Structure
```
backend/
├── config/
│   └── database.js      # MongoDB connection
├── models/
│   ├── Room.js          # Room model
│   ├── ChatMessage.js   # Chat message model
│   └── User.js          # User model
├── data/                # Legacy file storage (can be removed)
├── .env                 # Environment variables
├── server.js            # Main server file
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running locally or your Atlas cluster is accessible
2. Check your connection string format
3. Verify network connectivity and firewall settings
4. For Atlas: Ensure your IP is whitelisted

### Socket.IO Connection Issues
1. Check CORS configuration in server.js
2. Verify the frontend is connecting to the correct port
3. Check for network/firewall blocking WebSocket connections

## Production Deployment

1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name doodlesync-backend
```

4. Set up reverse proxy with Nginx or Apache if needed
5. Enable SSL/HTTPS for secure connections