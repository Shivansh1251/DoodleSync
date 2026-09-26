import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  document: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    trim: true,
    maxlength: 80,
    default: 'Guest'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  creatorSessionHash: {
    type: String,
    default: null,
    select: false,
    index: true
  },
  creatorAvatar: {
    type: String,
    default: null,
    maxlength: 2048
  },
  creatorType: {
    type: String,
    enum: ['user', 'guest', 'system'],
    default: 'guest',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  expiresAt: {
    type: Date,
    default: function guestRoomExpiry() {
      return this.creatorType === 'guest'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null;
    },
    expires: 0
  }
}, {
  timestamps: true
});

// Update lastModified on save
roomSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export default mongoose.model('Room', roomSchema);
