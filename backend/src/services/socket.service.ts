import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt.utils.js';
import { getTokenUser } from '../config/redis.js';
import { User } from '../models/user.model.js';
import type { Server as HttpsServer } from 'https';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';

type ServerType = HttpServer | HttpsServer;

interface UserSocket {
  userId: string;
  socketId: string;
}

/**
 * Socket.io setup for real-time chat
 */
export class SocketService {
  private io: Server;
  private onlineUsers: UserSocket[] = [];
  
  constructor(server: ServerType) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    this.setupSocketAuth();
    this.setupEventHandlers();
  }
  
  /**
   * Set up Socket.io authentication middleware
   */
  private setupSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        // Get token from handshake auth
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: Token required'));
        }
        
        // Verify JWT token
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return next(new Error('Authentication error: Invalid token'));
        }
        
        // Check if token exists in Redis
        const userId = await getTokenUser(token);
        
        if (!userId) {
          return next(new Error('Authentication error: Token expired or revoked'));
        }
        
        // Check if user exists
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }
        
        // Set user data in socket
        socket.data.user = {
          _id: user._id.toString(),
          username: user.username,
          email: user.email
        };
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }
  
  /**
   * Set up Socket.io event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user._id}`);
      
      // Add user to online users
      this.addUser(socket.data.user._id, socket.id);
      
      // Emit online users to all connected clients
      this.io.emit('getOnlineUsers', this.getOnlineUsers());
      
      // Join a chat room
      socket.on('joinChat', async (chatId: string) => {
        socket.join(chatId);
        console.log(`User ${socket.data.user._id} joined chat: ${chatId}`);
      });
      
      // Send a message
      socket.on('sendMessage', async (messageData: {
        content: string;
        chatId: string;
        attachments?: string[];
      }) => {
        try {
          const { content, chatId, attachments = [] } = messageData;
          
          // Check if chat exists
          const chat = await Chat.findById(chatId);
          
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }
          
          // Check if user is a participant in the chat
          if (!chat.participants.includes(socket.data.user._id)) {
            socket.emit('error', { message: 'You are not a participant in this chat' });
            return;
          }
          
          // Create and save message
          const newMessage = new Message({
            chat: chatId,
            sender: socket.data.user._id,
            content,
            attachments,
            readBy: [socket.data.user._id] // Sender has read the message
          });
          
          const savedMessage = await newMessage.save();
          
          // Populate sender info
          const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'username profilePicture')
            .populate('readBy', 'username profilePicture');
          
          // Update chat's last message
          await Chat.findByIdAndUpdate(chatId, { lastMessage: savedMessage._id });
          
          // Emit message to all users in the chat room
          this.io.to(chatId).emit('newMessage', populatedMessage);
          
          // Send notification to offline participants
          chat.participants.forEach((participantId) => {
            const participantSocket = this.getUserSocket(participantId.toString());
            
            if (participantSocket && participantId.toString() !== socket.data.user._id) {
              socket.to(participantSocket).emit('messageNotification', {
                chatId,
                message: populatedMessage
              });
            }
          });
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
      
      // Mark messages as read
      socket.on('markMessagesRead', async (chatId: string) => {
        try {
          const userId = socket.data.user._id;
          
          // Update messages that are not read by this user
          await Message.updateMany(
            {
              chat: chatId,
              readBy: { $ne: userId }
            },
            {
              $addToSet: { readBy: userId }
            }
          );
          
          // Notify other users in the chat
          socket.to(chatId).emit('messagesRead', {
            chatId,
            userId
          });
        } catch (error) {
          console.error('Mark messages read error:', error);
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });
      
      // User is typing
      socket.on('typing', (chatId: string) => {
        socket.to(chatId).emit('userTyping', {
          chatId,
          user: {
            _id: socket.data.user._id,
            username: socket.data.user.username
          }
        });
      });
      
      // User stopped typing
      socket.on('stopTyping', (chatId: string) => {
        socket.to(chatId).emit('userStoppedTyping', {
          chatId,
          user: {
            _id: socket.data.user._id,
            username: socket.data.user.username
          }
        });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user._id}`);
        this.removeUser(socket.id);
        this.io.emit('getOnlineUsers', this.getOnlineUsers());
      });
    });
  }
  
  /**
   * Add a user to online users
   */
  private addUser(userId: string, socketId: string) {
    // Remove existing socket for this user if exists
    this.onlineUsers = this.onlineUsers.filter((user) => user.userId !== userId);
    
    // Add new socket
    this.onlineUsers.push({ userId, socketId });
  }
  
  /**
   * Remove a user from online users
   */
  private removeUser(socketId: string) {
    this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socketId);
  }
  
  /**
   * Get all online users
   */
  private getOnlineUsers() {
    return this.onlineUsers.map((user) => user.userId);
  }
  
  /**
   * Get socket ID for a user
   */
  private getUserSocket(userId: string): string | null {
    const user = this.onlineUsers.find((user) => user.userId === userId);
    return user ? user.socketId : null;
  }
}