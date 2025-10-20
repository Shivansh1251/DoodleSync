import Room from '../models/Room.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

export class DatabaseService {
  // Room operations
  static async createRoom(roomId, document = null, createdBy = 'Anonymous') {
    try {
      const room = new Room({
        roomId,
        document,
        createdBy
      });
      return await room.save();
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        return await this.getRoomByRoomId(roomId);
      }
      throw error;
    }
  }

  static async getRoomByRoomId(roomId) {
    return await Room.findOne({ roomId });
  }

  static async updateRoom(roomId, document, userId = 'Anonymous') {
    return await Room.findOneAndUpdate(
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
  }

  static async deleteRoom(roomId) {
    await Room.deleteOne({ roomId });
    await ChatMessage.deleteMany({ roomId });
    return true;
  }

  static async getAllRooms(limit = 20) {
    return await Room.find({}, 'roomId lastModified createdBy')
      .sort({ lastModified: -1 })
      .limit(limit);
  }

  // Chat operations
  static async saveMessage(roomId, message) {
    const chatMessage = new ChatMessage({
      roomId,
      message
    });
    return await chatMessage.save();
  }

  static async getChatHistory(roomId, limit = 50) {
    const messages = await ChatMessage
      .find({ roomId })
      .sort({ 'message.timestamp': -1 })
      .limit(limit)
      .lean();
    return messages.map(msg => msg.message).reverse();
  }

  static async deleteChatHistory(roomId) {
    return await ChatMessage.deleteMany({ roomId });
  }

  // User operations
  static async createOrUpdateUser(socketId, userData) {
    return await User.findOneAndUpdate(
      { socketId },
      {
        socketId,
        userId: userData.id || socketId,
        name: userData.name || 'Anonymous',
        email: userData.email,
        lastActive: new Date(),
        currentRoom: userData.currentRoom
      },
      { upsert: true, new: true }
    );
  }

  static async updateUserActivity(socketId, currentRoom = null) {
    return await User.findOneAndUpdate(
      { socketId },
      { 
        lastActive: new Date(),
        currentRoom 
      }
    );
  }

  static async getUserBySocketId(socketId) {
    return await User.findOne({ socketId });
  }

  static async getActiveUsersInRoom(roomId) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return await User.find({
      currentRoom: roomId,
      lastActive: { $gte: fiveMinutesAgo }
    });
  }

  static async removeUserBySocketId(socketId) {
    return await User.deleteOne({ socketId });
  }

  // Analytics and stats
  static async getRoomStats(roomId) {
    const room = await Room.findOne({ roomId });
    const messageCount = await ChatMessage.countDocuments({ roomId });
    const activeUsers = await this.getActiveUsersInRoom(roomId);
    
    return {
      exists: !!room,
      lastModified: room?.lastModified,
      createdBy: room?.createdBy,
      messageCount,
      activeUserCount: activeUsers.length,
      activeUsers: activeUsers.map(u => ({ id: u.userId, name: u.name }))
    };
  }

  static async getGlobalStats() {
    const totalRooms = await Room.countDocuments();
    const totalMessages = await ChatMessage.countDocuments();
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    return {
      totalRooms,
      totalMessages,
      activeUsers
    };
  }
}

export default DatabaseService;