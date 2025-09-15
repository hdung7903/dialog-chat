import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import 'dotenv/config';
import { User } from '../models/user.model.js';
import type { IUser } from '../models/user.model.js';
import { createTokens } from '../utils/jwt.utils.js';

// Configuration for Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

// Initialize Google OAuth strategy
export const initializeGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ googleId: profile.id });
          
          if (existingUser) {
            return done(null, existingUser);
          }
          
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('Email not provided by Google'), undefined);
          }
          
          // Check if user exists with the same email
          const userWithEmail = await User.findOne({ email });
          
          if (userWithEmail) {
            // Link Google account to existing user
            userWithEmail.googleId = profile.id;
            await userWithEmail.save();
            return done(null, userWithEmail);
          }
          
          // Create new user
          const newUser = new User({
            googleId: profile.id,
            email,
            username: `user_${profile.id.substring(0, 8)}`,
            profilePicture: profile.photos?.[0]?.value || '',
            isVerified: true // Google users are automatically verified
          });
          
          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  });
};

// Helper to create tokens after Google authentication
export const handleGoogleAuthSuccess = async (userId: string): Promise<{ 
  success: boolean; 
  accessToken?: string; 
  refreshToken?: string;
  message?: string;
}> => {
  try {
    const tokens = await createTokens(userId);
    return { 
      success: true, 
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken 
    };
  } catch (error) {
    console.error('Google auth token creation error:', error);
    return { success: false, message: 'Failed to create authentication tokens' };
  }
};