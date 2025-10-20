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
    default: 'Anonymous'
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