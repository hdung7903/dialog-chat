import type { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt.utils.js';
import { getTokenUser } from '../config/redis.js';
import { User } from '../models/user.model.js';

/**
 * Authentication middleware to protect routes
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get token from header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Unauthorized: No token provided' }, 401);
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return c.json({ success: false, message: 'Unauthorized: Invalid token' }, 401);
    }
    
    // Check if token exists in Redis
    const userId = await getTokenUser(token);
    
    if (!userId) {
      return c.json({ success: false, message: 'Unauthorized: Token expired or revoked' }, 401);
    }
    
    // Check if user exists
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized: User not found' }, 401);
    }
    
    // Set user in request variables
    c.set('user', user);
    
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ success: false, message: 'Unauthorized: Authentication failed' }, 401);
  }
};