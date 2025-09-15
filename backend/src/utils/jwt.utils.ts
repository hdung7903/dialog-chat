import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { 
  saveToken, 
  saveRefreshToken, 
  removeToken, 
  removeRefreshToken 
} from '../config/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generate access token
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as any
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION as any
  });
};

/**
 * Helper to convert expiry time string to seconds
 */
const getExpiryInSeconds = (expiryString: string): number => {
  const unit = expiryString.slice(-1);
  const value = parseInt(expiryString.slice(0, -1), 10);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 900; // Default to 15 minutes
  }
};

/**
 * Create both tokens and save them to Redis
 */
export const createTokens = async (userId: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  // Calculate token expiry in seconds for Redis
  const accessExpiry = getExpiryInSeconds(JWT_ACCESS_EXPIRATION);
  const refreshExpiry = getExpiryInSeconds(JWT_REFRESH_EXPIRATION);

  // Save tokens to Redis
  await saveToken(userId, accessToken, accessExpiry);
  await saveRefreshToken(userId, refreshToken, refreshExpiry);

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Remove tokens from Redis
 */
export const removeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await removeToken(accessToken);
  await removeRefreshToken(refreshToken);
};