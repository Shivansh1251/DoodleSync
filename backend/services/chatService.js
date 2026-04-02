import ChatMessage from '../models/ChatMessage.js';

const chatService = {
  async saveMessage(roomId, message) {
    const chatMessage = new ChatMessage({ roomId, message });
    return chatMessage.save();
  },

  async getHistory(roomId, limit = 50) {
    const messages = await ChatMessage.find({ roomId })
      .sort({ 'message.timestamp': -1 })
      .limit(limit)
      .lean();

    return messages.map((entry) => entry.message).reverse();
  },

  async clearRoomChat(roomId) {
    return ChatMessage.deleteMany({ roomId });
  },
};

export default chatService;
