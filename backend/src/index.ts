import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config';
import { routes } from './routes/index.js'
import fs from 'node:fs';
import path from 'node:path';
import { connectDB } from './config/database.js';
import passport from 'passport';
import { initializeGoogleStrategy } from './config/passport.js';
import { redisClient } from './config/redis.js';
import { Server } from 'socket.io';

// Connect to MongoDB
connectDB();

// Initialize Passport
initializeGoogleStrategy();

const app = new Hono()

// Enable CORS
app.use('*', cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

// Mount the routes
app.route('/', routes)

// Create server with Hono
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`Swagger documentation available at http://localhost:${info.port}/api/docs`);
});

// Initialize Socket.io with the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
