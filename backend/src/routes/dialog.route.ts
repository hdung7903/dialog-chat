import { Hono } from 'hono';
import { DialogController } from '../controllers/dialog.controller.js';

export const dialogRoutes = new Hono();

// Route for detecting intent
dialogRoutes.post('/detect-intent', DialogController.detectIntent);