import { Hono } from 'hono';
import { ChatController } from '../controllers/chat.controller.js';

export const chatRoutes = new Hono();

// Route for getting chat history by session ID
chatRoutes.get('/history/:sessionId', ChatController.getSessionHistory);