import { User } from '../models/user.model.js';
import type { IUser } from '../models/user.model.js';
import { createTokens, removeTokens } from '../utils/jwt.utils.js';
import { getOTP, removeOTP, saveOTP } from '../config/redis.js';
import { sendOTPEmail, sendPasswordResetEmail } from './email.service.js';
import bcrypt from 'bcrypt';

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: { email: string; username: string; password: string }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          return { success: false, message: 'Email already in use' };
        }
        return { success: false, message: 'Username already taken' };
      }

      // Create new user
      const user = new User({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        isVerified: false
      });

      await user.save();

      // Send OTP verification email
      const otpResult = await sendOTPEmail(userData.email);
      
      if (!otpResult.success) {
        return { success: false, message: 'Failed to send verification email' };
      }

      return {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        userId: user._id.toString()
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  /**
   * Verify user email with OTP
   */
  static async verifyEmail(email: string, otp: string) {
    try {
      // Get the stored OTP
      const storedOTP = await getOTP(email);
      
      if (!storedOTP) {
        return { success: false, message: 'OTP expired or invalid' };
      }

      // Check if OTP matches
      if (storedOTP !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      // Update user verification status
      const user = await User.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Remove OTP from Redis
      await removeOTP(email);

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Email verification failed' };
    }
  }

  /**
   * Resend OTP verification email
   */
  static async resendOTP(email: string) {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isVerified) {
        return { success: false, message: 'Email already verified' };
      }

      // Remove existing OTP if any
      await removeOTP(email);

      // Send new OTP
      const otpResult = await sendOTPEmail(email);
      
      if (!otpResult.success) {
        return { success: false, message: 'Failed to send verification email' };
      }

      return { success: true, message: 'Verification code sent successfully' };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'Failed to resend verification code' };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if email is verified
      if (!user.isVerified) {
        return { success: false, message: 'Please verify your email before logging in' };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Generate tokens
      const userId = user._id.toString();
      const tokens = await createTokens(userId);

      return {
        success: true,
        user: {
          _id: userId,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || ''
        },
        ...tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  /**
   * Logout user
   */
  static async logout(accessToken: string, refreshToken: string) {
    try {
      await removeTokens(accessToken, refreshToken);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string, resetUrl: string) {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return { success: true, message: 'If your email is registered, you will receive a password reset link' };
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
      
      // Create reset link
      const resetLink = `${resetUrl}?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      // Save reset token to Redis with 15 minutes expiry
      await getOTP(email);
      await saveOTP(`reset:${email}`, resetToken, 900); // 15 minutes
      
      // Send password reset email
      await sendPasswordResetEmail(email, resetLink);
      
      return { success: true, message: 'If your email is registered, you will receive a password reset link' };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string, token: string, newPassword: string) {
    try {
      // Get reset token from Redis
      const resetToken = await getOTP(`reset:${email}`);
      
      if (!resetToken || resetToken !== token) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      // Find user
      const user = await User.findOne({ email });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Update password
      user.password = newPassword;
      await user.save();
      
      // Remove reset token
      await removeOTP(`reset:${email}`);
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }
}