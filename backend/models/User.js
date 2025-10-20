import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Anonymous'
  },
  email: {
    type: String,
    sparse: true // Allow null/undefined values, but enforce uniqueness when present
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  currentRoom: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ socketId: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ email: 1 }, { sparse: true });

export default mongoose.model('User', userSchema);