import { ConversationSession } from "../models/conversationModel";
import { getOrCreateSession } from "../models/conversationModel";

/**
 * Maximum number of messages to include in context
 */
const MAX_CONTEXT_LENGTH = 50;

export interface UserContext {
  topics?: string[];
  interests?: string[];
  questions?: string[];
  lastTopic?: string;
}

// Add this function to extract topics from messages
export const extractTopics = (message: string): string[] => {
  const topics: string[] = [];

  // Identify subject areas mentioned
  const subjects = [
    "math",
    "mathematics",
    "algebra",
    "geometry",
    "calculus",
    "science",
    "biology",
    "chemistry",
    "physics",
    "history",
    "geography",
    "literature",
    "english",
    "computer",
    "programming",
    "coding",
    "art",
    "music",
  ];

  const messageLower = message.toLowerCase();

  subjects.forEach((subject) => {
    if (messageLower.includes(subject)) {
      topics.push(subject);
    }
  });

  return topics;
};

/**
 * Extract user information from messages
 */
export const extractUserInfo = (
  message: string
): { name?: string; language?: string } => {
  const userInfo: { name?: string; language?: string } = {};

  // Extract name from common patterns
  const namePatterns = [
    /my name is\s+([^\.,!?]+)/i,
    /i am\s+([^\.,!?]+)/i,
    /call me\s+([^\.,!?]+)/i,
    /i'm\s+([^\.,!?]+)/i,
    /name['s]*\s+([^\.,!?]+)/i,
  ];

  // Also check if this is a direct name response (short text without verbs)
  const isSimpleName =
    message.length < 20 &&
    !message.includes(" is ") &&
    !message.includes(" am ") &&
    !message.includes(" are ");

  // First try the patterns
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      userInfo.name = match[1].trim();
      return userInfo;
    }
  }

  // If no pattern matched and it looks like a simple name, use it directly
  if (isSimpleName) {
    userInfo.name = message.trim().replace(/[.,!?]$/, "");
  }

  return userInfo;
};

/**
 * Builds context string for the AI model based on conversation history
 */
export const buildContextString = (
  session: ConversationSession,
  currentMessage: string,
  isQuickReply = false
): string => {
  // Start with very explicit instructions about greeting behavior
  let context = `You are IntelliBuddy, a helpful AI assistant. Provide friendly, concise responses.`;


  context += ` You can and should use markdown formatting in your responses when appropriate, 
  including **bold** for emphasis, *italics*, \`code\`, bullet lists, numbered lists, 
  headings with #, ##, and tables. Format code blocks using triple backticks.`;


  // Add personalization if available with clear instructions about first-time vs returning users
  if (session.userInfo.name) {
    // Check if this is likely a first interaction
    const isFirstInteraction = session.messages.length <= 3;

    if (isQuickReply) {
      context += ` This message is from a quick reply button, NOT a new user introducing themselves. 
      DO NOT respond with "Nice to meet you" phrases. The user's name is ONLY "${session.userInfo.name}", 
      not any part of their current message.`;
    }

    if (isFirstInteraction) {
      context += ` You're talking to ${session.userInfo.name}. This is your FIRST conversation with them. Use "Nice to meet you" instead of "Nice to talk to you again" when greeting them.`;
    } else {
      context += ` You're talking to ${session.userInfo.name}. Address them by name occasionally.`;
    }
  }

  // Add contextual information
  if (session.userInfo.context) {
    if (
      session.userInfo.context.topics &&
      session.userInfo.context.topics.length > 0
    ) {
      context += ` The user has previously asked about: ${session.userInfo.context.topics.join(
        ", "
      )}.`;
    }

    if (session.userInfo.context.lastTopic) {
      context += ` Their most recent topic of interest was ${session.userInfo.context.lastTopic}.`;
    }
  }

  // Add language preference if available
  if (session.userInfo.language && session.userInfo.language !== "en") {
    context += ` Respond in ${session.userInfo.language} language.`;
  }

  // Add conversation history
  if (session.messages.length > 0) {
    // Take the most recent messages within limit
    const recentMessages = session.messages
      .slice(-MAX_CONTEXT_LENGTH)
      .map(
        (msg) =>
          `${msg.sender === "user" ? "User" : "IntelliBuddy"}: ${msg.text}`
      )
      .join("\n");

    context += `\n\nConversation history:\n${recentMessages}\n\nUser: ${currentMessage}\nIntelliBuddy:`;
  } else {
    context += `\n\nUser: ${currentMessage}\nIntelliBuddy:`;
  }

  return context;
};

/**
 * Process a user message to update user info and build context
 */
export const processMessage = (
  session: ConversationSession,
  message: string,
  isQuickReply = false
): { updatedSession: ConversationSession; context: string } => {

  if (!isQuickReply) {
    const extractedInfo = extractUserInfo(message);

    // Update session with extracted info
    if (extractedInfo.name && !session.userInfo.name) {
      session.userInfo.name = extractedInfo.name;
    }
  }
  // Extract user info from message
  const extractedInfo = extractUserInfo(message);

  // Update session with extracted info
  if (extractedInfo.name && !session.userInfo.name) {
    session.userInfo.name = extractedInfo.name;
  }

  // Extract and add topics to context
  const topics = extractTopics(message);
  if (!session.userInfo.context) {
    session.userInfo.context = {};
  }

  if (topics.length > 0) {
    session.userInfo.context.lastTopic = topics[0];

    if (!session.userInfo.context.topics) {
      session.userInfo.context.topics = [];
    }

    topics.forEach((topic) => {
      if (
        session.userInfo.context &&
        session.userInfo.context.topics &&
        !session.userInfo.context.topics.includes(topic)
      ) {
        session.userInfo.context.topics.push(topic);
      }
    });
  }

  // Extract question patterns
  if (
    message.includes("?") ||
    message.toLowerCase().startsWith("how") ||
    message.toLowerCase().startsWith("what") ||
    message.toLowerCase().startsWith("why")
  ) {
    if (!session.userInfo.context.questions) {
      session.userInfo.context.questions = [];
    }
    session.userInfo.context.questions.push(message);
  }

  // Build context for AI
  const context = buildContextString(session, message, isQuickReply);

  return {
    updatedSession: session,
    context,
  };
};

/**
 * Detect language from message (simplified version)
 * For a more robust implementation, you might want to use a dedicated library
 */
export const detectLanguage = (message: string): string | null => {
  // Simple language detection for common phrases
  // In a real application, you would use a more sophisticated library

  const spanishPatterns = /hola|cómo estás|buenos días|gracias|por favor/i;
  const frenchPatterns = /bonjour|salut|merci|s'il vous plaît|comment ça va/i;
  const germanPatterns = /hallo|guten tag|danke|bitte|wie geht es dir/i;

  if (spanishPatterns.test(message)) return "es";
  if (frenchPatterns.test(message)) return "fr";
  if (germanPatterns.test(message)) return "de";

  return null; // Default to null (system will use English)
};

export default {
  extractUserInfo,
  buildContextString,
  processMessage,
  detectLanguage,
  MAX_CONTEXT_LENGTH,
};

// Make sure updateUserInfo is properly implemented
export const updateUserInfo = (
  sessionId: string,
  userInfo: Partial<ConversationSession["userInfo"]>
): void => {
  const session = getOrCreateSession(sessionId);
  session.userInfo = {
    ...session.userInfo,
    ...userInfo,
    lastInteraction: new Date(), // Always update the interaction time
  };
};
