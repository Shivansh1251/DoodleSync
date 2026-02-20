// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import session from "express-session";
import connectDB from "./config/database.js";
import Room from "./models/Room.js";
import ChatMessage from "./models/ChatMessage.js";
import User from "./models/User.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import oauthRoutes from "./routes/oauth.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(express.json());

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS middleware for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 4000;

// Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);

// REST API Routes
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    res.json({ 
      exists: !!room, 
      data: room ? room.document : null,
      lastModified: room ? room.lastModified : null 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room data' });
  }
});

app.get('/api/rooms/:roomId/chat', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await getChatHistory(roomId, limit);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({}, 'roomId lastModified createdBy')
      .sort({ lastModified: -1 })
      .limit(20);
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.delete('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    await Room.deleteOne({ roomId });
    await ChatMessage.deleteMany({ roomId });
    activeRooms.delete(roomId);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// POST endpoint to create a test room
app.post('/api/create-test-room', async (req, res) => {
  try {
    const roomId = `test-room-${Date.now()}`;
    const testRoom = new Room({
      roomId,
      document: {
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
          gridSize: null
        }
      },
      createdBy: 'test-user'
    });
    await testRoom.save();
    res.json({ 
      success: true, 
      roomId,
      message: 'Test room created successfully' 
    });
  } catch (error) {
    console.error('Error creating test room:', error);
    res.status(500).json({ error: 'Failed to create test room' });
  }
});

// In-memory store for active rooms (for real-time access)
const activeRooms = new Map();

// Helper functions for database operations
const saveRoomToDB = async (roomId, document, userId = 'Anonymous') => {
  try {
    await Room.findOneAndUpdate(
      { roomId },
      { 
        document, 
        lastModified: new Date(),
        createdBy: userId 
      },
      { 
        upsert: true, 
        new: true 
      }
    );
    console.log(`Room ${roomId} saved to database`);
  } catch (error) {
    console.error(`Error saving room ${roomId}:`, error);
  }
};

const loadRoomFromDB = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId });
    return room ? room.document : null;
  } catch (error) {
    console.error(`Error loading room ${roomId}:`, error);
    return null;
  }
};

const saveChatMessage = async (roomId, message) => {
  try {
    const chatMessage = new ChatMessage({
      roomId,
      message
    });
    await chatMessage.save();
    console.log(`Chat message saved for room ${roomId}`);
  } catch (error) {
    console.error(`Error saving chat message for room ${roomId}:`, error);
  }
};

const getChatHistory = async (roomId, limit = 50) => {
  try {
    const messages = await ChatMessage
      .find({ roomId })
      .sort({ 'message.timestamp': -1 })
      .limit(limit)
      .lean();
    return messages.map(msg => msg.message).reverse(); // Return in chronological order
  } catch (error) {
    console.error(`Error getting chat history for room ${roomId}:`, error);
    return [];
  }
};

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join-room", async (roomId, user) => {
    socket.join(roomId);
    socket.data.user = user || { id: socket.id, name: "Anonymous" };
    
    console.log(`[join-room] Socket ${socket.id} joining room ${roomId} as ${socket.data.user.name}`);
    
    // Save/update user in database
    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        {
          socketId: socket.id,
          userId: socket.data.user.id,
          name: socket.data.user.name,
          avatar: socket.data.user.avatar,
          lastActive: new Date(),
          currentRoom: roomId
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving user:', error);
    }
    
    // Load room from database if not in memory
    if (!activeRooms.has(roomId)) {
      const roomDoc = await loadRoomFromDB(roomId);
      activeRooms.set(roomId, roomDoc);
    }

    // send current document to new client
    socket.emit("doc-init", activeRooms.get(roomId));
    
    // Send chat history to new client
    const chatHistory = await getChatHistory(roomId);
    socket.emit("chat-history", chatHistory);

    // Small delay to ensure socket is fully joined
    setTimeout(() => {
      // broadcast presence - get fresh room data
      console.log(`[presence] Broadcasting join for room=${roomId} user=${socket.data.user?.name}`)
      
      // Get all users currently in the room
      const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set()
      const usersInRoom = []
      
      console.log(`[presence] Room ${roomId} has ${roomSockets.size} sockets:`, Array.from(roomSockets))
      
      for (const socketId of roomSockets) {
        const socketInstance = io.sockets.sockets.get(socketId)
        if (socketInstance?.data?.user) {
          usersInRoom.push({
            id: socketId,
            name: socketInstance.data.user.name,
            avatar: socketInstance.data.user.avatar,
            joinedAt: new Date()
          })
          console.log(`[presence] Added user: ${socketInstance.data.user.name} (${socketId})`)
        } else {
          console.log(`[presence] Socket ${socketId} has no user data`)
        }
      }
      
      console.log(`[presence] Final users list for room ${roomId}:`, usersInRoom)
      
      // Broadcast to ALL users in room (including sender)
      io.to(roomId).emit("presence-update", {
        type: "join",
        user: socket.data.user,
        roomUsers: usersInRoom,
        sockets: Array.from(roomSockets),
      });
      
      console.log(`[presence] Broadcasted presence-update to ${roomSockets.size} sockets in room ${roomId}`)
    }, 100);
  });

  // receive doc updates (you can send patches or full doc)
  socket.on("doc-update", async (roomId, docDelta) => {
    // Update active room data
    activeRooms.set(roomId, docDelta);

    // Save to database (async, non-blocking)
    saveRoomToDB(roomId, docDelta, socket.data.user?.id);

    // broadcast to others in same room (except sender)
    socket.to(roomId).emit("doc-update", docDelta);
  });

  // chat message
  socket.on("chat-message", async (roomId, message) => {
    // message: { author: {id,name}, text, ts }
    // Add error handling for undefined message
    if (!message || typeof message !== 'object') {
      console.error(`[chat] Invalid message received for room=${roomId}:`, message);
      return;
    }
    
    // ensure an id and timestamp exists
    message.id ||= Date.now().toString();
    message.timestamp ||= new Date();
    
    console.log(`[chat] room=${roomId} from=${message?.author?.name}: ${message?.text}`)
    console.log(`[chat] Broadcasting message to room ${roomId}:`, message); // DEBUG
    
    // Save message to database
    saveChatMessage(roomId, message);
    
    // Broadcast to all users in room (including sender)
    io.to(roomId).emit("chat-message", message);
    console.log(`[chat] Message broadcasted to ${io.sockets.adapter.rooms.get(roomId)?.size || 0} users in room ${roomId}`); // DEBUG
  });

  // Handle user activity (drawing, moving, etc.)
  socket.on("activity", (roomId, activityData) => {
    // Add user info and timestamp
    const activity = {
      ...activityData,
      userId: socket.id,
      userName: socket.data.user?.name || 'Anonymous',
      timestamp: new Date()
    };
    
    console.log(`[activity] room=${roomId} user=${activity.userName} type=${activity.type} active=${activity.active}`);
    
    // Broadcast activity to other users in room (not sender)
    socket.to(roomId).emit("user-activity", activity);
  });

  // Handle leave-room event
  socket.on("leave-room", async (roomId) => {
    console.log(`[leave-room] room=${roomId} user=${socket.data.user?.name}`);
    
    // Send leave system message to chat
    if (socket.data.user) {
      const leaveMessage = {
        id: Date.now().toString(),
        author: { id: 'system', name: 'System' },
        text: `${socket.data.user.name} has left the room`,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      // Save to database
      await saveChatMessage(roomId, leaveMessage);
      
      // Broadcast to room
      io.to(roomId).emit("chat-message", leaveMessage);
      
      // Broadcast presence update
      socket.to(roomId).emit("presence-update", {
        type: "leave",
        user: socket.data.user
      });
    }
    
    // Leave the room
    socket.leave(roomId);
    
    // Update user status in database
    try {
      await User.findByIdAndUpdate(
        socket.data.user?.id,
        {
          isOnline: false,
          lastActive: new Date(),
          currentRoom: null
        }
      );
    } catch (error) {
      console.error('Error updating user on leave:', error);
    }
  });

  // Handle cursor movement for collaborative cursors
  socket.on("cursor-move", (roomId, cursorData) => {
    // Add user info and broadcast to others in room
    const cursor = {
      x: cursorData.x,
      y: cursorData.y,
      userId: socket.id,
      userName: socket.data.user?.name || 'Anonymous',
      userAvatar: socket.data.user?.avatar,
      color: cursorData.color || '#6366f1', // Default color
      timestamp: Date.now()
    };
    
    // Broadcast cursor position to other users in room (not sender)
    socket.to(roomId).emit("cursor-update", cursor);
  });

  socket.on("save-room", async (roomId) => {
    const roomData = activeRooms.get(roomId);
    if (roomData) {
      await saveRoomToDB(roomId, roomData, socket.data.user?.id);
    }
  });

  socket.on("disconnecting", async () => {
    // Update user status in database
    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { 
          lastActive: new Date(),
          currentRoom: null 
        }
      );
    } catch (error) {
      console.error('Error updating user on disconnect:', error);
    }

    // notify others
    const roomsJoined = Array.from(socket.rooms).filter((r) => r !== socket.id);
    roomsJoined.forEach((roomId) => {
      console.log(`[leave] room=${roomId} user=${socket.data.user?.name}`)
      io.to(roomId).emit("presence-update", { type: "leave", user: socket.data.user });
    });
  });
});

server.listen(PORT, () => console.log("Server listening on", PORT));
