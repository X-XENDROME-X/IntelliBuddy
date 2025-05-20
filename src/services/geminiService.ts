import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config from '../config';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  userInfo: {
    name?: string;
    language?: string;
  };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
}

// Session storage - in a production app, this would be a database
const chatSessions = new Map<string, ChatSession>();

/**
 * Get or create a chat session
 */
export const getOrCreateSession = (sessionId: string): ChatSession => {
  if (!chatSessions.has(sessionId)) {
    // Create new session
    chatSessions.set(sessionId, {
      sessionId,
      messages: [],
      userInfo: {}
    });
  }
  return chatSessions.get(sessionId)!;
};

/**
 * Updates user information in the session
 */
export const updateUserInfo = (sessionId: string, data: Partial<ChatSession['userInfo']>): void => {
  const session = getOrCreateSession(sessionId);
  session.userInfo = {
    ...session.userInfo,
    ...data
  };
  chatSessions.set(sessionId, session);
};

/**
 * Generate a response using Gemini API with context management
 */
export const generateChatResponse = async (
  sessionId: string, 
  userMessage: string
): Promise<ChatResponse> => {
  // Get or create session
  const session = getOrCreateSession(sessionId);
  
  // Extract user's name from the message if present and not already known
  if (!session.userInfo.name && userMessage.toLowerCase().includes('my name is')) {
    const nameMatch = userMessage.match(/my name is\s+([^\.,!?]+)/i);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      updateUserInfo(sessionId, { name });
    }
  }
  
  // Add user message to session history
  session.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });
  
  // Create history context for the model
  const history = session.messages.slice(-config.maxContextLength);
  
  try {
    // Set up the model with safety settings
    const model = genAI.getGenerativeModel({
      model: config.geminiModel,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Create chat session
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    // Build the prompt with personalization if available
    let prompt = userMessage;
    
    // Create system context with personalization if available
    if (session.userInfo.name) {
      // Add personalization context if it's not already in the prompt
      if (!history.some(msg => 
        msg.role === 'model' && 
        msg.content.includes(`${session.userInfo.name}`)
      )) {
        prompt = `Remember that you're talking to ${session.userInfo.name}. ${prompt}`;
      }
    }
    
    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    
    // Add AI response to session
    session.messages.push({
      role: 'model',
      content: response,
      timestamp: new Date()
    });
    
    // Ensure we don't exceed context length
    if (session.messages.length > config.maxContextLength * 2) {
      session.messages = session.messages.slice(-config.maxContextLength);
    }
    
    // Update session storage
    chatSessions.set(sessionId, session);
    
    return { 
      message: response, 
      sessionId 
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

/**
 * Clear a chat session
 */
export const clearSession = (sessionId: string): void => {
  chatSessions.delete(sessionId);
};

export default {
  generateChatResponse,
  getOrCreateSession,
  updateUserInfo,
  clearSession
};
