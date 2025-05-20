import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ConversationSession {
  sessionId: string;
  messages: Message[];
  userInfo: {
    name?: string;
    language?: string;
    lastInteraction: Date;
    context?: {
      topics?: string[];
      interests?: string[];
      questions?: string[];
      lastTopic?: string;
    };
  };
}

// In-memory storage for conversations (persists until page refresh)
const sessions = new Map<string, ConversationSession>();

/**
 * Create a new conversation session
 */
export const createSession = (): ConversationSession => {
  const sessionId = uuidv4();
  const session: ConversationSession = {
    sessionId,
    messages: [
      {
        id: uuidv4(),
        text: "Hi there! I'm IntelliBuddy. What's your name?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ],
    userInfo: {
      lastInteraction: new Date(),
      context: {
        topics: [],
        interests: [],
        questions: []
      }
    },
  };
  
  sessions.set(sessionId, session);
  return session;
};



/**
 * Get an existing session by ID
 */
export const getSession = (sessionId: string): ConversationSession | undefined => {
  return sessions.get(sessionId);
};

/**
 * Get or create a session
 */
export const getOrCreateSession = (sessionId?: string): ConversationSession => {
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    // Update last interaction time
    session.userInfo.lastInteraction = new Date();
    return session;
  }
  return createSession();
};

/**
 * Add a message to a session
 */
export const addMessage = (sessionId: string, message: Omit<Message, 'id'>): Message => {
  const session = getOrCreateSession(sessionId);
  const newMessage: Message = {
    ...message,
    id: uuidv4(),
  };
  
  session.messages.push(newMessage);
  session.userInfo.lastInteraction = new Date();
  return newMessage;
};

/**
 * Update user information in a session
 */
export const updateUserInfo = (sessionId: string, userInfo: Partial<ConversationSession['userInfo']>): void => {
  const session = getOrCreateSession(sessionId);
  session.userInfo = {
    ...session.userInfo,
    ...userInfo,
  };
};

/**
 * Clear a session
 */
export const clearSession = (sessionId: string): boolean => {
  return sessions.delete(sessionId);
};

export default {
  createSession,
  getSession,
  getOrCreateSession,
  addMessage,
  updateUserInfo,
  clearSession,
};
