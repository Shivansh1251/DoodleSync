import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    id: {
      type: String,
      required: true
    },
    author: {
      id: String,
      name: String
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ roomId: 1, 'message.timestamp': -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);