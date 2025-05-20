import { GoogleGenerativeAI } from "@google/generative-ai";
import conversationModel, { Message } from '../models/conversationModel';
import contextManager from './contextManager';
import rateLimiter from './rateLimiter';



export interface RateLimitError {
  isRateLimitError: true;
  message: string;
  nextAvailableTime: Date;
}



const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);


export const translateMessage = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Translate the following text to ${targetLanguage} language. 
    The source language could be any language - detect it automatically.
    Preserve all formatting, markdown, and special characters. 
    Only return the translated text with no explanations:
    
    ${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();

    return translatedText;

  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
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

  // Check rate limits before making the request
  const limitStatus = rateLimiter.checkLimit();

  if (!limitStatus.canMakeRequest) {
    return {
      isRateLimitError: true,
      message: limitStatus.message || "Rate limit exceeded. Please try again later.",
      nextAvailableTime: limitStatus.nextAvailableTime || new Date(Date.now() + 60000)
    };
  }

  try {
    // Increment counter BEFORE making the request
    rateLimiter.incrementCounter();

    // Get or create session
    const session = conversationModel.getOrCreateSession(sessionId);



    // Add user message to session
    conversationModel.addMessage(session.sessionId, {
      text: prompt,
      sender: 'user',
      timestamp: new Date()
    });

    // Detect language if not already set
    if (!session.userInfo.language) {
      const detectedLanguage = contextManager.detectLanguage(prompt);
      if (detectedLanguage) {
        conversationModel.updateUserInfo(session.sessionId, {
          language: detectedLanguage
        });
      }
    }

    // Get conversation phase for context
    const isFirstInteraction = session.messages.length <= 2;
    const hasJustProvidedName = session.messages.length <= 4 && session.userInfo.name;

    // Create enhanced prompt if needed for quick replies
    let enhancedPrompt = prompt;

    // Handle quick reply context to prevent "Nice to meet you" responses
    if (isQuickReply) {
      enhancedPrompt = `${prompt} 
      (NOTE: This message is from a Quick Reply button click, not a new user introduction. 
       Do NOT respond with 'Nice to meet you' or treat this text as the user's name. 
       The user has already introduced themselves earlier in the conversation.)`;
    }

    // Set up generation parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };
    // Process message and get context
    const { context } = contextManager.processMessage(
      session,
      enhancedPrompt,
      isQuickReply
    );

    let enhancedContext = context;
    if (language !== 'en') {
      enhancedContext = `${context}\n\nImportant: Respond in ${language} language only, regardless of the language of the query.`;
    }

    // Generate response with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: enhancedContext }] }],
      generationConfig
    });

    let responseText = result.response.text();

    // Post-process response to fix any remaining "Nice to meet you" issues
    if (isQuickReply && responseText.includes("Nice to meet you")) {
      responseText = responseText.replace(/Nice to meet you,?\s+([^!.]+)[!.]?/g,
        "Regarding $1,");
    }

    // Fix case where bot might still use quick reply as name even with our prevention
    if (isQuickReply || !isFirstInteraction) {
      // Extract the exact prompt to check if it appears in the response with "Nice to meet you"
      const promptMatch = new RegExp(`Nice to meet you,?\\s+${prompt}[!.]?`, 'i');
      if (promptMatch.test(responseText)) {
        responseText = responseText.replace(promptMatch, `About ${prompt},`);
      }
    }

    // Add AI response to session
    conversationModel.addMessage(session.sessionId, {
      text: responseText,
      sender: 'bot',
      timestamp: new Date()
    });

    // Return response with session ID
    return {
      text: responseText,
      sessionId: session.sessionId
    };
  } catch (error) {
    console.error("Error generating response:", error);
    const errorMessage = "I'm sorry, I encountered an error. Please try again later.";

    // If we have a session, add the error message to it
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

  // Check rate limits before making the request
  const limitStatus = rateLimiter.checkLimit();

  if (!limitStatus.canMakeRequest) {
    // Return generic suggestions if rate-limited
    return ["Tell me more", "Thanks for the info"];
  }

  try {

    rateLimiter.incrementCounter();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on this message from an AI assistant: "${lastMessage}"
    Generate two short (2-5 words) response options that a user might want to reply with.
    Format your response as a JSON array with exactly two strings and nothing else:
    ["suggestion 1", "suggestion 2"]
    Important: The suggestions MUST be in ${language} language.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response before parsing JSON
    const cleanedResponse = cleanJsonResponse(responseText);
    console.log("Cleaned response:", cleanedResponse);

    // Extract the JSON array from the cleaned response
    try {
      const suggestions = JSON.parse(cleanedResponse);
      if (Array.isArray(suggestions) && suggestions.length >= 2) {
        return suggestions.slice(0, 2);
      }
    } catch (e) {
      console.error("Failed to parse AI suggestions:", e);
      // Add debugging output
      console.error("Raw response:", responseText);
      console.error("Cleaned response:", cleanedResponse);
    }

    // Fallback options
    return ["Tell me more", "Thanks for the info"];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return ["Tell me more", "Thanks for the info"];
  }
};

const cleanJsonResponse = (responseText: string): string => {
  // Remove markdown code blocks ```json ... ```
  let cleaned: string = responseText.replace(/```json\n?|```/g, "");
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
};

export default {
  generateResponse,
  clearConversation
};
