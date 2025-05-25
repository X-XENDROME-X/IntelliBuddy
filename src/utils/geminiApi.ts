import conversationModel, { Message } from '../models/conversationModel';
import contextManager from './contextManager';
import rateLimiter from './rateLimiter';

export interface RateLimitError {
  isRateLimitError: true;
  message: string;
  nextAvailableTime: Date;
}

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const translateMessage = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    // Call backend instead of Gemini directly
    const response = await fetch(`${API_BASE_URL}/gemini/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

/**
 * Generate response using Gemini API with context management
 */
export const generateResponse = async (
  prompt: string,
  sessionId?: string,
  isQuickReply = false,
  language = 'en'
): Promise<{
  text: string;
  sessionId: string;
} | RateLimitError> => {

  if (!navigator.onLine) {
    return {
      text: "You appear to be offline. Please check your internet connection and try again.",
      sessionId: sessionId || conversationModel.createSession().sessionId
    };
  }

  const limitStatus = rateLimiter.checkLimit();
  if (!limitStatus.canMakeRequest) {
    return {
      isRateLimitError: true,
      message: limitStatus.message || "Rate limit exceeded. Please try again later.",
      nextAvailableTime: limitStatus.nextAvailableTime || new Date(Date.now() + 60000)
    };
  }

  try {

    rateLimiter.incrementCounter();
    const session = conversationModel.getOrCreateSession(sessionId);
    
    conversationModel.addMessage(session.sessionId, {
      text: prompt,
      sender: 'user',
      timestamp: new Date()
    });
    
    if (!session.userInfo.language) {
      const detectedLanguage = contextManager.detectLanguage(prompt);
      if (detectedLanguage) {
        conversationModel.updateUserInfo(session.sessionId, { 
          language: detectedLanguage 
        });
      }
    }
    
    const isFirstInteraction = session.messages.length <= 2;
    const hasJustProvidedName = session.messages.length <= 4 && session.userInfo.name;
    
    let enhancedPrompt = prompt;
    if (isQuickReply) {
      enhancedPrompt = `${prompt} 
      (NOTE: This message is from a Quick Reply button click, not a new user introduction. 
       Do NOT respond with 'Nice to meet you' or treat this text as the user's name. 
       The user has already introduced themselves earlier in the conversation.)`;
    }
    
    const { context } = contextManager.processMessage(
      session, 
      enhancedPrompt, 
      isQuickReply
    );
    
    let enhancedContext = context;
    if (language !== 'en') {
      enhancedContext = `${context}\n\nImportant: Respond in ${language} language only, regardless of the language of the query.`;
    }

    // Call backend instead of Gemini directly 
    const response = await fetch(`${API_BASE_URL}/gemini/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        sessionId: session.sessionId,
        isQuickReply,
        language,
        context,
        enhancedPrompt,
        enhancedContext,
        isFirstInteraction,
        hasJustProvidedName
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          isRateLimitError: true,
          message: "Rate limit exceeded. Please try again later.",
          nextAvailableTime: new Date(Date.now() + 60000)
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.isRateLimitError) {
      return data;
    }

   
    conversationModel.addMessage(session.sessionId, {
      text: data.text,
      sender: 'bot',
      timestamp: new Date()
    });

   
    return {
      text: data.text,
      sessionId: session.sessionId
    };
  } catch (error) {
    console.error("Error generating response:", error);
    const errorMessage = "I'm sorry, I encountered an error. Please try again later.";
    
   
    if (sessionId) {
      conversationModel.addMessage(sessionId, {
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      });
    }
    
    return {
      text: errorMessage,
      sessionId: sessionId || conversationModel.createSession().sessionId
    };
  }
};

/**
 * Clear conversation session 
 */
export const clearConversation = (sessionId: string): boolean => {
  return conversationModel.clearSession(sessionId);
};

export const generateSuggestions = async (
  lastMessage: string,
  sessionId: string,
  language = 'en'
): Promise<string[]> => {
  
  const limitStatus = rateLimiter.checkLimit();
  if (!limitStatus.canMakeRequest) {
    return ["Tell me more", "Thanks for the info"];
  }

  try {

    rateLimiter.incrementCounter();
    
    const response = await fetch(`${API_BASE_URL}/gemini/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastMessage, sessionId, language })
    });

    const data = await response.json();
    return data.suggestions || ["Tell me more", "Thanks for the info"];

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return ["Tell me more", "Thanks for the info"]; 
  }
};

export default {
  generateResponse,
  clearConversation
};
