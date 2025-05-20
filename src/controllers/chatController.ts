import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import geminiService from '../services/geminiService';
import languageDetection from '../utils/languageDetection';

/**
 * Handle chat messages and generate responses
 */
export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId } = req.body;
  
  try {
    // Validate input
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    // Use provided sessionId or generate a new one
    const chatSessionId = sessionId || uuidv4();
    
    // Detect language (only for longer messages to save API calls)
    if (message.length > 10) {
      const detectedLanguage = await languageDetection.detectLanguage(message);
      // Update user language preference if detected
      if (detectedLanguage !== 'en') {
        geminiService.updateUserInfo(chatSessionId, { language: detectedLanguage });
      }
    }
    
    // Generate response
    const response = await geminiService.generateChatResponse(chatSessionId, message);
    
    res.status(200).json({
      message: response.message,
      sessionId: chatSessionId
    });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ 
      error: 'Failed to process your message. Please try again.',
      sessionId: sessionId || uuidv4()
    });
  }
};

/**
 * Reset/clear a chat session
 */
export const resetChatSession = (req: Request, res: Response): void => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required' });
    return;
  }
  
  try {
    geminiService.clearSession(sessionId);
    res.status(200).json({ message: 'Chat session cleared successfully', sessionId });
  } catch (error) {
    console.error('Error clearing chat session:', error);
    res.status(500).json({ error: 'Failed to clear chat session' });
  }
};

export default {
  handleChatMessage,
  resetChatSession
};
