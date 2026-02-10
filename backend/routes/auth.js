import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { sendWelcomeEmail, sendLoginOTP, sendPasswordResetOTP, generateOTP } from '../utils/emailService.js';

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      oauthProvider: 'local',
      isGuest: false,
      isVerified: true // Set to true for now, can add email verification later
    });

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail signup if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully! Check your email for a welcome message.',
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// REQUEST LOGIN OTP
router.post('/login/request-otp', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is OAuth user
    if (user.oauthProvider !== 'local') {
      return res.status(400).json({ 
        error: `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.` 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate and save OTP
    const otp = generateOTP();
    user.loginOTP = otp;
    user.loginOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    const emailSent = await sendLoginOTP(user.email, user.name, otp);

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }

    res.json({
      message: 'OTP sent to your email. Please check your inbox.',
      email: user.email
    });
  } catch (error) {
    console.error('Login OTP request error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// VERIFY LOGIN OTP
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      loginOTP: otp,
      loginOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// TRADITIONAL LOGIN (without OTP - for backward compatibility)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is OAuth user
    if (user.oauthProvider !== 'local') {
      return res.status(400).json({ 
        error: `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.` 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GUEST LOGIN
router.post('/guest', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate unique guest ID
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create guest user
    const user = new User({
      name: name.trim(),
      guestId,
      isGuest: true,
      oauthProvider: 'guest'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Guest session created',
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

// GET CURRENT USER
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user.toPublicProfile() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, preferences } = req.body;
    const user = req.user;

    if (user.isGuest) {
      return res.status(403).json({ error: 'Guests cannot update profile' });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// UPLOAD AVATAR
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = req.user;
    if (user.isGuest) {
      return res.status(403).json({ error: 'Guests cannot upload avatars' });
    }

    // Save avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// SET PRESET AVATAR
router.post('/avatar/preset', authenticateToken, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    const user = req.user;
    if (user.isGuest) {
      return res.status(403).json({ error: 'Guests cannot set avatars' });
    }

    // Save avatar URL
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar preset error:', error);
    res.status(500).json({ error: 'Failed to set avatar' });
  }
});

// FORGOT PASSWORD - REQUEST OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If account exists, OTP will be sent to your email' });
    }

    if (user.oauthProvider !== 'local') {
      return res.status(400).json({ 
        error: `This account uses ${user.oauthProvider} login. Password reset is not available.` 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    const emailSent = await sendPasswordResetOTP(user.email, user.name, otp);

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }

    res.json({ 
      message: 'If account exists, OTP will be sent to your email',
      email: user.email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// VERIFY RESET PASSWORD OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ 
      message: 'OTP verified successfully',
      email: user.email 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// RESET PASSWORD WITH OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// RESET PASSWORD WITH TOKEN (backward compatibility)
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET ACTIVITY HISTORY
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      activity: user.activityHistory.slice(-20).reverse() // Last 20 activities
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// LOGOUT
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    user.socketId = undefined;
    user.currentRoom = null;
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
