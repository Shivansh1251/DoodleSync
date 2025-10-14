// Simple Socket.IO client test for DoodleSync whiteboard
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:4000';
const ROOM_ID = 'test-room-artillery';
const USER = { id: 'test-user-123', name: 'Artillery Test User' };

console.log('🚀 Starting DoodleSync Whiteboard Socket.IO Test...');

// Create multiple clients to simulate concurrent users
const createClient = (clientId) => {
  const socket = io(SERVER_URL, { transports: ['websocket'] });
  
  socket.on('connect', () => {
    console.log(`✅ Client ${clientId} connected: ${socket.id}`);
    
    // Join room
    socket.emit('join-room', ROOM_ID, { ...USER, id: `${USER.id}-${clientId}`, name: `${USER.name} ${clientId}` });
  });

  socket.on('doc-init', (doc) => {
    console.log(`📄 Client ${clientId} received initial doc:`, doc ? 'Document exists' : 'Empty document');
  });

  socket.on('doc-update', (docDelta) => {
    console.log(`🎨 Client ${clientId} received drawing update:`, Object.keys(docDelta));
  });

  socket.on('chat-message', (message) => {
    console.log(`💬 Client ${clientId} received chat: ${message.author?.name}: ${message.text}`);
  });

  socket.on('presence-update', (update) => {
    console.log(`👥 Client ${clientId} presence update: ${update.type} - ${update.user?.name}`);
  });

  // Simulate user actions after joining
  setTimeout(() => {
    // Send drawing update
    console.log(`🎨 Client ${clientId} sending drawing update...`);
    socket.emit('doc-update', ROOM_ID, {
      shapes: [
        {
          id: `shape-${clientId}-${Date.now()}`,
          type: 'draw',
          x: Math.random() * 800,
          y: Math.random() * 600,
          props: { size: 'm', color: 'black' }
        }
      ]
    });
  }, 2000);

  setTimeout(() => {
    // Send chat message
    console.log(`💬 Client ${clientId} sending chat message...`);
    socket.emit('chat-message', ROOM_ID, {
      author: { id: `${USER.id}-${clientId}`, name: `${USER.name} ${clientId}` },
      text: `Hello from client ${clientId}! Testing whiteboard functionality.`,
      ts: Date.now()
    });
  }, 4000);

  setTimeout(() => {
    // Save room
    console.log(`💾 Client ${clientId} saving room...`);
    socket.emit('save-room', ROOM_ID);
  }, 6000);

  setTimeout(() => {
    console.log(`👋 Client ${clientId} disconnecting...`);
    socket.disconnect();
  }, 8000);

  socket.on('disconnect', () => {
    console.log(`❌ Client ${clientId} disconnected`);
  });

  socket.on('error', (error) => {
    console.error(`🚨 Client ${clientId} error:`, error);
  });

  return socket;
};

// Create 3 concurrent clients
console.log('Creating 3 concurrent test clients...');
for (let i = 1; i <= 3; i++) {
  setTimeout(() => createClient(i), i * 500); // Stagger connections
}

// Exit after all tests complete
setTimeout(() => {
  console.log('🏁 Test completed!');
  process.exit(0);
}, 12000);