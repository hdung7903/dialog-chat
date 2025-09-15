import type { Context } from 'hono';
import { AuthService } from '../services/auth.service.js';

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(c: Context) {
    try {
      const { email, username, password } = await c.req.json();
      
      // Validate input
      if (!email || !username || !password) {
        return c.json({ success: false, message: 'All fields are required' }, 400);
      }
      
      const result = await AuthService.register({ email, username, password });
      
      if (!result.success) {
        return c.json(result, 400);
      }
      
      return c.json(result, 201);
    } catch (error) {
      console.error('Register controller error:', error);
      return c.json({ success: false, message: 'Registration failed' }, 500);
    }
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(c: Context) {
    try {
      const { email, otp } = await c.req.json();
      
      // Validate input
      if (!email || !otp) {
        return c.json({ success: false, message: 'Email and OTP are required' }, 400);
      }
      
      const result = await AuthService.verifyEmail(email, otp);
      
      if (!result.success) {
        return c.json(result, 400);
      }
      
      return c.json(result);
    } catch (error) {
      console.error('Verify email controller error:', error);
      return c.json({ success: false, message: 'Email verification failed' }, 500);
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(c: Context) {
    try {
      const { email } = await c.req.json();
      
      // Validate input
      if (!email) {
        return c.json({ success: false, message: 'Email is required' }, 400);
      }
      
      const result = await AuthService.resendOTP(email);
      
      if (!result.success) {
        return c.json(result, 400);
      }
      
      return c.json(result);
    } catch (error) {
      console.error('Resend OTP controller error:', error);
      return c.json({ success: false, message: 'Failed to resend verification code' }, 500);
    }
  }

  /**
   * Login user
   */
  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json();
      
      // Validate input
      if (!email || !password) {
        return c.json({ success: false, message: 'Email and password are required' }, 400);
      }
      
      const result = await AuthService.login(email, password);
      
      if (!result.success) {
        return c.json(result, 401);
      }
      
      return c.json(result);
    } catch (error) {
      console.error('Login controller error:', error);
      return c.json({ success: false, message: 'Login failed' }, 500);
    }
  }

  /**
   * Logout user
   */
  static async logout(c: Context) {
    try {
      const { accessToken, refreshToken } = await c.req.json();
      
      // Validate input
      if (!accessToken || !refreshToken) {
        return c.json({ success: false, message: 'Access token and refresh token are required' }, 400);
      }
      
      const result = await AuthService.logout(accessToken, refreshToken);
      
      return c.json(result);
    } catch (error) {
      console.error('Logout controller error:', error);
      return c.json({ success: false, message: 'Logout failed' }, 500);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(c: Context) {
    try {
      const { email } = await c.req.json();
      
      // Validate input
      if (!email) {
        return c.json({ success: false, message: 'Email is required' }, 400);
      }
      
      // Get frontend URL from environment or request origin
      const frontendUrl = process.env.FRONTEND_URL || c.req.header('origin') || 'http://localhost:3001';
      const resetUrl = `${frontendUrl}/reset-password`;
      
      const result = await AuthService.requestPasswordReset(email, resetUrl);
      
      return c.json(result);
    } catch (error) {
      console.error('Request password reset controller error:', error);
      return c.json({ success: false, message: 'Failed to process password reset request' }, 500);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(c: Context) {
    try {
      const { email, token, newPassword } = await c.req.json();
      
      // Validate input
      if (!email || !token || !newPassword) {
        return c.json({ success: false, message: 'All fields are required' }, 400);
      }
      
      if (newPassword.length < 6) {
        return c.json({ success: false, message: 'Password must be at least 6 characters' }, 400);
      }
      
      const result = await AuthService.resetPassword(email, token, newPassword);
      
      if (!result.success) {
        return c.json(result, 400);
      }
      
      return c.json(result);
    } catch (error) {
      console.error('Reset password controller error:', error);
      return c.json({ success: false, message: 'Failed to reset password' }, 500);
    }
  }
}