import { ChatMessage } from '../models/chatMessage.js';

/**
 * Service for handling chat-related database operations
 */
export class ChatService {
  /**
   * Save a chat message to the database
   */
  static async saveMessage(messageData: {
    sessionId: string;
    text: string;
    fulfillmentText: string;
    intentDisplayName?: string | null;
    confidence?: number;
    languageCode?: string;
  }) {
    try {
      const message = new ChatMessage(messageData);
      await message.save();
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a specific session
   */
  static async getSessionHistory(sessionId: string) {
    try {
      return await ChatMessage.find({ sessionId })
        .sort({ timestamp: 1 })
        .lean();
    } catch (error) {
      console.error('Error fetching session history:', error);
      throw error;
    }
  }
}