// src/utils/infoExtractor.ts
import { addToContext, setUserName, getUserInfo } from './userInfoStore';

export const extractUserName = (message: string): string | null => {
  const patterns = [
    /my name is\s+([A-Za-z\s]+)/i,
    /i am\s+([A-Za-z\s]+)/i,
    /call me\s+([A-Za-z\s]+)/i,
    /i'm\s+([A-Za-z\s]+)/i,
    /name['']?s\s+([A-Za-z\s]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const potentialName = match[1].trim();
      // Filter out common phrases that aren't names
      const nonNames = ['a', 'an', 'the', 'just', 'only', 'still', 'also', 'very', 'quite', 'really'];
      if (!nonNames.includes(potentialName.toLowerCase()) && potentialName.length > 1) {
        return potentialName;
      }
    }
  }
  
  return null;
};

export const processUserMessage = (message: string): void => {
  // Extract name if present
  const name = extractUserName(message);
  if (name) {
    setUserName(name);
  }
  
  // Extract other potential information (examples)
  if (message.includes('favorite') || message.includes('prefer')) {
    if (message.includes('color')) {
      const colorMatch = message.match(/(?:favorite|prefer|like) color\s+(?:is|:)?\s+([a-zA-Z]+)/i);
      if (colorMatch && colorMatch[1]) {
        addToContext('favorite_color', colorMatch[1].toLowerCase());
      }
    }
    
    if (message.includes('food') || message.includes('dish')) {
      const foodMatch = message.match(/(?:favorite|prefer|like) (?:food|dish)\s+(?:is|:)?\s+([a-zA-Z\s]+)/i);
      if (foodMatch && foodMatch[1]) {
        addToContext('favorite_food', foodMatch[1].trim());
      }
    }
  }
  
  // Extract location if mentioned
  const locationMatch = message.match(/(?:I (?:live|am) in|I'm from)\s+([a-zA-Z\s,]+)/i);
  if (locationMatch && locationMatch[1]) {
    addToContext('location', locationMatch[1].trim());
  }
};
