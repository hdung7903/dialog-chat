/**
 * Database seeder and management utility
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/database.js';
import { ChatMessage } from '../models/chatMessage.js';

const clearAllData = async () => {
  try {
    console.log('Clearing all data from the database...');
    await ChatMessage.deleteMany({});
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

const seedSampleData = async () => {
  try {
    console.log('Seeding sample data...');
    
    const sampleMessages = [
      {
        sessionId: 'sample-session-123',
        text: 'Hello, how can I help you?',
        fulfillmentText: 'I am a virtual assistant. How can I assist you today?',
        intentDisplayName: 'Default Welcome Intent',
        confidence: 0.9,
        languageCode: 'en'
      },
      {
        sessionId: 'sample-session-123',
        text: 'What services do you offer?',
        fulfillmentText: 'We offer a range of services including virtual assistance, information retrieval, and more.',
        intentDisplayName: 'Services Intent',
        confidence: 0.85,
        languageCode: 'en'
      }
    ];
    
    await ChatMessage.insertMany(sampleMessages);
    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const displayHelp = () => {
  console.log(`
Database Management Utility

Available commands:
  --clear     Clear all data from the database
  --seed      Seed the database with sample data
  --help      Display this help message
  `);
};

const main = async () => {
  try {
    await connectDB();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--clear')) {
      await clearAllData();
    } else if (args.includes('--seed')) {
      await seedSampleData();
    } else if (args.includes('--help') || args.length === 0) {
      displayHelp();
    }
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();