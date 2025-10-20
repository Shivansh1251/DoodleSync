import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Room from './models/Room.js';
import ChatMessage from './models/ChatMessage.js';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Clearing existing data...');
    await Room.deleteMany({});
    await ChatMessage.deleteMany({});
    await User.deleteMany({});

    console.log('Creating sample rooms...');
    
    // Create a sample room
    const sampleRoom = new Room({
      roomId: 'sample-room-1',
      document: {
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
          gridSize: null
        }
      },
      createdBy: 'system'
    });
    await sampleRoom.save();

    // Create sample chat messages
    const sampleMessages = [
      {
        roomId: 'sample-room-1',
        message: {
          id: '1',
          author: { id: 'user1', name: 'Alice' },
          text: 'Welcome to DoodleSync!',
          timestamp: new Date(Date.now() - 60000) // 1 minute ago
        }
      },
      {
        roomId: 'sample-room-1',
        message: {
          id: '2',
          author: { id: 'user2', name: 'Bob' },
          text: 'This is a great collaboration tool!',
          timestamp: new Date(Date.now() - 30000) // 30 seconds ago
        }
      }
    ];

    for (const msgData of sampleMessages) {
      const chatMessage = new ChatMessage(msgData);
      await chatMessage.save();
    }

    console.log('Database seeded successfully!');
    console.log('Sample room created: sample-room-1');
    console.log('Sample chat messages added');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
if (process.argv[2] === '--seed') {
  seedDatabase();
} else {
  console.log('Run with --seed flag to seed the database: npm run seed');
}

export default seedDatabase;