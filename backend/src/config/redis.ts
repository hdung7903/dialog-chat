import { Redis } from 'ioredis';
import 'dotenv/config';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

/**
 * Redis client instance
 */
export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // Retry connection with exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis connection established');
});

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err);
});

redisClient.on('close', () => {
  console.log('Redis connection closed');
});

// Helper functions for token management
export const saveToken = async (userId: string, token: string, expiry: number): Promise<void> => {
  await redisClient.set(`token:${token}`, userId, 'EX', expiry);
};

export const getTokenUser = async (token: string): Promise<string | null> => {
  return await redisClient.get(`token:${token}`);
};

export const removeToken = async (token: string): Promise<void> => {
  await redisClient.del(`token:${token}`);
};

export const saveRefreshToken = async (userId: string, token: string, expiry: number): Promise<void> => {
  await redisClient.set(`refresh:${token}`, userId, 'EX', expiry);
};

export const getRefreshTokenUser = async (token: string): Promise<string | null> => {
  return await redisClient.get(`refresh:${token}`);
};

export const removeRefreshToken = async (token: string): Promise<void> => {
  await redisClient.del(`refresh:${token}`);
};

// Helper functions for OTP management
export const saveOTP = async (email: string, otp: string, expiry: number = 300): Promise<void> => {
  await redisClient.set(`otp:${email}`, otp, 'EX', expiry); // Default 5 minutes expiry
};

export const getOTP = async (email: string): Promise<string | null> => {
  return await redisClient.get(`otp:${email}`);
};

export const removeOTP = async (email: string): Promise<void> => {
  await redisClient.del(`otp:${email}`);
};