import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Detects the language of a message
 * Returns ISO 639-1 language code
 */
export const detectLanguage = async (text: string): Promise<string> => {
  // For short texts, let's use a simpler approach first
  if (text.length < 10) {
    return config.defaultLanguage;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: config.geminiModel });
    
    const prompt = `
      Analyze the following text and determine its language. 
      Return ONLY the ISO 639-1 language code (like 'en' for English, 'es' for Spanish, etc.).
      Do not include any other text or explanations.
      
      Text: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();
    
    // Extract just the language code if there's any additional text
    const languageCode = response.match(/^[a-z]{2}$/);
    return languageCode ? languageCode[0] : config.defaultLanguage;
  } catch (error) {
    console.error('Error detecting language:', error);
    return config.defaultLanguage;
  }
};

export default {
  detectLanguage
};
