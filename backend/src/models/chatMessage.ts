import mongoose from 'mongoose';

// Define the schema
const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  fulfillmentText: {
    type: String,
    required: true
  },
  intentDisplayName: {
    type: String,
    default: null
  },
  confidence: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  languageCode: {
    type: String,
    default: 'en'
  }
});

// Create and export the model
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);