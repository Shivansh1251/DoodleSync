import User from '../models/User.js';

const userService = {
  async getUserById(userId) {
    return User.findById(userId);
  },

  async getUserByEmail(email) {
    return User.findOne({ email: email?.toLowerCase() });
  },

  async setUserSocketState(userId, socketId, currentRoom = null) {
    return User.findByIdAndUpdate(
      userId,
      {
        socketId,
        currentRoom,
        lastActive: new Date(),
      },
      { new: true }
    );
  },

  async clearSocketState(socketId) {
    return User.updateMany(
      { socketId },
      {
        $set: {
          socketId: null,
          currentRoom: null,
          lastActive: new Date(),
        },
      }
    );
  },
};

export default userService;
