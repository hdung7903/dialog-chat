import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller.js';

export const authRoutes = new Hono();

// Authentication routes
authRoutes.post('/register', AuthController.register);
authRoutes.post('/verify-email', AuthController.verifyEmail);
authRoutes.post('/resend-otp', AuthController.resendOTP);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', AuthController.logout);
authRoutes.post('/forgot-password', AuthController.requestPasswordReset);
authRoutes.post('/reset-password', AuthController.resetPassword);