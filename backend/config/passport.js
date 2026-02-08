import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last active
            user.lastActive = Date.now();
            await user.save();
            return done(null, user);
          }

          // Check if email already exists with different provider
          user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.oauthProvider = 'google';
            user.lastActive = Date.now();
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value.toLowerCase(),
            name: profile.displayName,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            oauthProvider: 'google',
            isVerified: true,
            isGuest: false
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
