const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface BackendApiResponse {
  text: string;
  success: boolean;
}

export interface RateLimitError {
  isRateLimitError: true;
  error: string;
}

export const generateResponseSecure = async (
  prompt: string,
  context?: string
): Promise<BackendApiResponse | RateLimitError> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          isRateLimitError: true,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text,
      success: data.success
    };
  } catch (error) {
    console.error('Backend API Error:', error);
    throw error;
  }
};

export const generateSuggestionsSecure = async (
  lastMessage: string,
  sessionId: string
): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastMessage,
        sessionId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || ["Tell me more", "Thanks"];
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return ["Tell me more", "Thanks"];
  }
};

export const translateMessageSecure = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation API Error:', error);
    return text;
  }
};
