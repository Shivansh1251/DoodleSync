import Room from '../models/Room.js';

const roomService = {
  async getRoomById(roomId) {
    return Room.findOne({ roomId });
  },

  async getRecentRooms(limit = 20) {
    return Room.find({}, 'roomId lastModified createdBy')
      .sort({ lastModified: -1 })
      .limit(limit);
  },

  async upsertRoom(roomId, document, createdBy = 'Anonymous') {
    return Room.findOneAndUpdate(
      { roomId },
      {
        document,
        lastModified: new Date(),
        createdBy,
      },
      {
        upsert: true,
        new: true,
      }
    );
  },

  async deleteRoom(roomId) {
    return Room.deleteOne({ roomId });
  },
};

export default roomService;
