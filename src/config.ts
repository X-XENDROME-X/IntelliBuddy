import dotenv from 'dotenv';
dotenv.config();

export default {
  geminiApiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY',
  geminiModel: 'gemini-2.0-flash',
  defaultLanguage: 'en',
  maxContextLength: 10, // Number of messages to retain in context
  responseTimeout: 30000 // 30 seconds timeout for API calls
};
