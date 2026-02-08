import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  
  // User Type
  isGuest: {
    type: Boolean,
    default: false
  },
  guestId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'guest'],
    default: 'local'
  },
  
  // Profile
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Activity
  activityHistory: [{
    action: String,
    roomId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Current State
  socketId: String,
  currentRoom: {
    type: String,
    default: null
  },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
  
  // Login OTP
  loginOTP: String,
  loginOTPExpires: Date,
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  
}, {
  timestamps: true
});

// Additional indexes (email, googleId, guestId already have unique+sparse indexes from field definitions)
userSchema.index({ socketId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add activity to history
userSchema.methods.addActivity = function(action, roomId) {
  this.activityHistory.push({ action, roomId });
  // Keep only last 50 activities
  if (this.activityHistory.length > 50) {
    this.activityHistory = this.activityHistory.slice(-50);
  }
  this.lastActive = Date.now();
};

// Generate public profile
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    isGuest: this.isGuest,
    preferences: this.preferences,
    lastActive: this.lastActive,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);