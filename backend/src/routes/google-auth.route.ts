import { Hono } from 'hono';
import { GoogleAuthController } from '../controllers/google-auth.controller.js';

export const googleAuthRoutes = new Hono();

// Google OAuth routes
googleAuthRoutes.get('/google', GoogleAuthController.googleAuth);
googleAuthRoutes.get('/google/callback', GoogleAuthController.googleCallback);