const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables from .env file FIRST
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Log environment variables (remove in production)
console.log('🔍 Environment check:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Import your exact gemini logic
app.use('/api/gemini', require('./routes/gemini'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IntelliBuddy server running on port ${PORT}`);
});
