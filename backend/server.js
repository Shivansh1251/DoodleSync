// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;

// In-memory store for simplicity (use Redis / DB in prod)
const rooms = new Map();

// Helper: load/save room doc to disk (simple persistence)
const persistRoom = (roomId) => {
  const data = rooms.get(roomId);
  if (!data) return;
  fs.mkdirSync(path.resolve("./data"), { recursive: true });
  fs.writeFileSync(path.resolve(`./data/${roomId}.json`), JSON.stringify(data));
};
const loadRoom = (roomId) => {
  const file = path.resolve(`./data/${roomId}.json`);
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file));
    } catch (e) { return null; }
  }
  return null;
};

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join-room", (roomId, user) => {
    socket.join(roomId);
    socket.data.user = user || { id: socket.id, name: "Anonymous" };
    // ensure room present
    if (!rooms.has(roomId)) {
      const persisted = loadRoom(roomId);
      rooms.set(roomId, persisted || null);
    }

    // send current document to new client
    socket.emit("doc-init", rooms.get(roomId));

    // broadcast presence
    console.log(`[join] room=${roomId} user=${socket.data.user?.name}`)
    io.to(roomId).emit("presence-update", {
      type: "join",
      user: socket.data.user,
      sockets: Array.from(io.sockets.adapter.rooms.get(roomId) || []),
    });
  });

  // receive doc updates (you can send patches or full doc)
  socket.on("doc-update", (roomId, docDelta) => {
    // naive merge: replace server doc with incoming doc
    // For production: apply patches or CRDT merges
    rooms.set(roomId, docDelta);

    // broadcast to others in same room (except sender)
    socket.to(roomId).emit("doc-update", docDelta);
  });

  // chat message
  socket.on("chat-message", (roomId, message) => {
    // message: { author: {id,name}, text, ts }
    // Add error handling for undefined message
    if (!message || typeof message !== 'object') {
      console.error(`[chat] Invalid message received for room=${roomId}:`, message);
      return;
    }
    
    // ensure an id exists to de-dup on client if needed
    message.id ||= Date.now();
    console.log(`[chat] room=${roomId} from=${message?.author?.name}: ${message?.text}`)
    io.to(roomId).emit("chat-message", message);
  });

  socket.on("save-room", (roomId) => {
    persistRoom(roomId);
  });

  socket.on("disconnecting", () => {
    // notify others
    const roomsJoined = Array.from(socket.rooms).filter((r) => r !== socket.id);
    roomsJoined.forEach((roomId) => {
  console.log(`[leave] room=${roomId} user=${socket.data.user?.name}`)
      io.to(roomId).emit("presence-update", { type: "leave", user: socket.data.user });
    });
  });
});

server.listen(PORT, () => console.log("Server listening on", PORT));
