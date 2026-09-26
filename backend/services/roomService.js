import Room from '../models/Room.js';

const roomService = {
  async getRoomById(roomId) {
    return Room.findOne({ roomId });
  },

  async getRecentRooms(limit = 20) {
    return Room.find({
      visibility: 'public',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
    }, 'roomId lastModified createdBy creatorAvatar creatorType createdAt')
      .sort({ lastModified: -1 })
      .limit(limit);
  },

  async upsertRoom(roomId, document, createdBy = 'Anonymous') {
    return Room.findOneAndUpdate(
      { roomId },
      {
        $set: { document, lastModified: new Date() },
        $setOnInsert: {
          createdBy: createdBy === 'Anonymous' ? 'Guest' : String(createdBy).slice(0, 80),
          creatorType: 'guest',
          visibility: 'public',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
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
