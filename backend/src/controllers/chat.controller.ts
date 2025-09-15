import type { Context } from 'hono';
import { ChatService } from '../services/chat.service.js';

export class ChatController {
  /**
   * Get chat history for a specific session
   */
  static async getSessionHistory(c: Context) {
    try {
      const sessionId = c.req.param('sessionId');
      
      if (!sessionId) {
        return c.json({ error: 'Session ID is required' }, 400);
      }
      
      const history = await ChatService.getSessionHistory(sessionId);
      return c.json(history);
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      return c.json({ error: 'Failed to retrieve chat history' }, 500);
    }
  }

  /**
   * Save a message to the database
   * Note: This is typically called after processing with Dialogflow
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
      return await ChatService.saveMessage(messageData);
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }
}