import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Google OAuth routes
if (isGoogleConfigured) {
  // Initiate Google OAuth
  router.get('/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  // Google OAuth callback
  router.get('/google/callback',
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
      session: false 
    }),
    (req, res) => {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    }
  );
} else {
  // Fallback routes if OAuth not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.' 
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth is not configured.' 
    });
  });
}

export default router;
