import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPaperPlane,
  FaTrash,
  FaExclamationCircle,
} from "react-icons/fa";
import { generateResponse, clearConversation } from "../utils/geminiApi";
import botImage from "../assets/intellibuddy.png";
import { useTheme } from "../theme/ThemeProvider";
import { updateUserInfo } from "../utils/contextManager";
import {
  generateSuggestions,
  RateLimitError,
  translateMessage,
} from "../utils/geminiApi";
import { FaWifi, FaCheckCircle } from "react-icons/fa";
import useOnlineStatus from "../utils/useOnlineStatus";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning!";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon!";
  } else if (hour >= 17 && hour < 19) {
    return "Good evening!";
  } else if (hour >= 19 && hour < 24) {
    return "Good night!";
  } else {
    return "Good night!";
  }
};

// Combined greeting function with name and time
const getFullGreeting = (userName?: string): string => {
  const timeGreeting = getTimeBasedGreeting();

  // If it's "Good night!", skip the greeting (no time-based greeting)
  const isNight = timeGreeting === "Good night!";

  if (userName) {
    return isNight
      ? `Welcome back, ${userName}. How can I help you today?`
      : `${timeGreeting} Welcome back, ${userName}. How can I help you today?`;
  }

  return isNight
    ? `I'm IntelliBuddy. What's your name and how can I help you today? 

Tip: You can select your preferred language from the top before starting to chat!`
    : `${timeGreeting} I'm IntelliBuddy. What's your name and how can I help you today? 
  
Tip: You can select your preferred language from the top before starting to chat!`;
};

type QuickReply = {
  text: string;
  action: () => void;
};

type ReactionType = "heart" | "laugh" | "smile" | "angry" | "sad" | "wow";

interface Reaction {
  type: ReactionType;
  count: number;
  userAdded?: boolean;
}

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  quickReplies?: QuickReply[];
  isQuickReply?: boolean;
  userReacted?: boolean;
  reactions?: Reaction[];
  isReactionResponse?: boolean;
  parentMessageId?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
};

const ChatbotWidget: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Language rate limit state
  const [languageRateLimited, setLanguageRateLimited] = useState(() => {
    const saved = localStorage.getItem("intellibuddy-language-rate-limited");
    return saved === "true";
  });

  const [languageSwitchCount, setLanguageSwitchCount] = useState(() => {
    const saved = localStorage.getItem("intellibuddy-language-switch-count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [languageLimitReset, setLanguageLimitReset] = useState(() => {
    const saved = localStorage.getItem("intellibuddy-language-limit-reset");
    return saved ? new Date(saved) : null;
  });

  const [languageCountdown, setLanguageCountdown] = useState(() => {
    const saved = localStorage.getItem("intellibuddy-language-limit-reset");
    if (saved) {
      const resetTime = new Date(saved);
      const now = new Date();
      const timeLeft = resetTime.getTime() - now.getTime();
      if (timeLeft > 0) {
        return Math.ceil(timeLeft / 1000);
      }
    }
    return 0;
  });

  // For language rate limit countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (languageRateLimited && languageLimitReset) {
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = languageLimitReset!.getTime() - now.getTime();

        if (timeLeft <= 0) {
          // Time's up, reset the language rate limit
          setLanguageRateLimited(false);
          setLanguageSwitchCount(0);
          setLanguageLimitReset(null);
          setLanguageCountdown(0);

          // Clear from localStorage
          localStorage.removeItem("intellibuddy-language-rate-limited");
          localStorage.removeItem("intellibuddy-language-switch-count");
          localStorage.removeItem("intellibuddy-language-limit-reset");
        } else {
          // Update the countdown
          const secondsLeft = Math.ceil(timeLeft / 1000);
          setLanguageCountdown(secondsLeft);

          // Check again in 1 second
          timer = setTimeout(updateCountdown, 1000);
        }
      };

      // Start the countdown
      updateCountdown();
    }

    // Clean up timer on unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [languageRateLimited, languageLimitReset]);

  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const [messages, setMessages] = useState<Message[]>(() => {
    // This will run only once during component initialization
    const initialGreeting = getFullGreeting();

    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 19) timeOfDay = "evening";
    else timeOfDay = "night";

    return [
      {
        id: "1",
        text: initialGreeting,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [],
        timeOfDay: timeOfDay,
      },
    ];
  });

  useEffect(() => {
    const translateInitialGreeting = async () => {
      // Skip if language is English
      if (selectedLanguage === "en") return;

      try {
        const translatedGreeting = await translateMessage(
          getFullGreeting(),
          selectedLanguage
        );

        setMessages((prev) => {
          // Only translate if we still have just the initial message
          if (prev.length === 1 && prev[0].id === "1") {
            return [
              {
                ...prev[0],
                text: translatedGreeting,
              },
            ];
          }
          return prev;
        });
      } catch (error) {
        console.error("Error translating initial greeting:", error);
      }
    };

    translateInitialGreeting();
  }, []);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    top: number;
    left: number;
    messageId: string | null;
    sender?: 'user' | 'bot';
  }>({
    visible: false,
    top: 0,
    left: 0,
    messageId: null,
    sender: undefined
  });

  const [copyNotification, setCopyNotification] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: "",
  });


  // API Rate limit state
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean;
    message: string;
    countdown: number;
    nextAvailable: Date | null;
  }>(() => {
    const savedRateLimit = localStorage.getItem("intellibuddy-rate-limit");
    if (savedRateLimit) {
      try {
        const parsed = JSON.parse(savedRateLimit);
        // Check if the rate limit is still valid
        if (
          parsed.nextAvailable &&
          new Date(parsed.nextAvailable) > new Date()
        ) {
          return {
            ...parsed,
            nextAvailable: new Date(parsed.nextAvailable),
          };
        }
      } catch (e) {
        console.error("Error parsing saved rate limit", e);
      }
    }
    return {
      isLimited: false,
      message: "",
      countdown: 0,
      nextAvailable: null,
    };
  });

  // Save API rate limit to localStorage when it changes
  useEffect(() => {
    if (rateLimitInfo.isLimited && rateLimitInfo.nextAvailable) {
      localStorage.setItem(
        "intellibuddy-rate-limit",
        JSON.stringify({
          ...rateLimitInfo,
          nextAvailable: rateLimitInfo.nextAvailable.toISOString(),
        })
      );
    } else {
      localStorage.removeItem("intellibuddy-rate-limit");
    }
  }, [rateLimitInfo]);

  // Save language rate limit states to localStorage
  useEffect(() => {
    localStorage.setItem(
      "intellibuddy-language-rate-limited",
      String(languageRateLimited)
    );
    localStorage.setItem(
      "intellibuddy-language-switch-count",
      String(languageSwitchCount)
    );

    if (languageLimitReset) {
      localStorage.setItem(
        "intellibuddy-language-limit-reset",
        languageLimitReset.toISOString()
      );
    } else {
      localStorage.removeItem("intellibuddy-language-limit-reset");
    }
  }, [languageRateLimited, languageSwitchCount, languageLimitReset]);

  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState<boolean>(false);

  // Update handleContextMenu to work with both mouse and touch events
  const handleContextMenu = (
    e: React.MouseEvent | React.TouchEvent,
    messageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;

    const chatContainer = document.querySelector('.chat-widget-container');
    const chatBounds = chatContainer?.getBoundingClientRect();
    if (!chatBounds) return;

    const contextMenuWidth = 240;
    const contextMenuHeight = message.sender === 'bot' ? 100 : 50;

    let left: number, top: number;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      left = touch.clientX;
      top = touch.clientY;
    } else {
      // Mouse event
      left = (e as React.MouseEvent).clientX;
      top = (e as React.MouseEvent).clientY;
    }

    // Ensure menu stays within chatbot boundaries
    if (left + contextMenuWidth > chatBounds.right) {
      left = chatBounds.right - contextMenuWidth - 10;
    }
    if (left < chatBounds.left) {
      left = chatBounds.left + 10;
    }
    if (top + contextMenuHeight > chatBounds.bottom) {
      top = chatBounds.bottom - contextMenuHeight - 10;
    }
    if (top < chatBounds.top) {
      top = chatBounds.top + 10;
    }

    setContextMenu({
      visible: true,
      top,
      left,
      messageId: messageId,
      sender: message.sender,
    });
  };

  // Add long press handlers
  const handleTouchStart = (e: React.TouchEvent, messageId: string) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      handleContextMenu(e, messageId);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };


  const handleOutsideClick = () => {
    setContextMenu({
      visible: false,
      top: 0,
      left: 0,
      messageId: null,
      sender: undefined
    });
  };

  const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "de", name: "German", flag: "🇩🇪" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return "en";
  });

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    // This ensures the initial message is properly translated on page load
    const translateInitialMessage = async () => {
      if (selectedLanguage === "en") return;

      try {
        // Only translate the first message if it's the greeting
        if (messages.length === 1 && messages[0].sender === "bot") {
          const translatedText = await translateMessage(
            messages[0].text,
            selectedLanguage
          );

          setMessages([
            {
              ...messages[0],
              text: translatedText,
            },
          ]);
        }
      } catch (error) {
        console.error("Error translating initial message:", error);
      }
    };

    translateInitialMessage();
  }, []);


  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextMenu.visible) {
      const handleClickOutside = (event: MouseEvent) => {
        // Close menu if click is outside the menu
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
          setContextMenu({
            visible: false,
            top: 0,
            left: 0,
            messageId: null,
          });
        }
      };

      // Add escape key handling
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setContextMenu({
            visible: false,
            top: 0,
            left: 0,
            messageId: null,
          });
        }
      };

      // Listen for clicks and escape key
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);

      // Also close on scroll events
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.addEventListener('scroll', handleOutsideClick);
      }

      // Clean up event listeners
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        if (chatMessages) {
          chatMessages.removeEventListener('scroll', handleOutsideClick);
        }
      };
    }
  }, [contextMenu.visible]);


  const handleReaction = (messageId: string, reactionType: ReactionType) => {
    setContextMenu({ visible: false, top: 0, left: 0, messageId: null });

    setMessages((prev) => {
      // Find the message we're reacting to
      const updatedMessages = [...prev];
      const messageIndex = updatedMessages.findIndex(
        (msg) => msg.id === messageId
      );
      if (messageIndex === -1 || updatedMessages[messageIndex].sender !== "bot")
        return prev;

      const message = { ...updatedMessages[messageIndex] };

      // Initialize reactions if needed
      if (!message.reactions) {
        message.reactions = [];
      }

      // Find any previous reaction by user
      const previousReaction = message.reactions.find((r) => r.userAdded);
      const previousReactionType = previousReaction?.type;

      // Check if clicking the same emoji (toggle off)
      const isSameReaction = previousReactionType === reactionType;

      // If toggling off the same reaction
      if (isSameReaction) {
        // Remove the reaction
        message.reactions = message.reactions.filter((r) => !r.userAdded);
        message.userReacted = false;

        // Find and remove the reaction response message
        const reactionResponseIndex = updatedMessages.findIndex(
          (msg) =>
            msg.sender === "bot" &&
            msg.isReactionResponse === true &&
            msg.parentMessageId === messageId
        );

        if (reactionResponseIndex !== -1) {
          updatedMessages.splice(reactionResponseIndex, 1);
        }

        updatedMessages[messageIndex] = message;
        return updatedMessages;
      }

      // If switching to a different reaction or adding new one

      // Remove previous reaction if it exists
      message.reactions = message.reactions.filter((r) => !r.userAdded);

      // Add the new reaction
      message.reactions.push({
        type: reactionType,
        count: 1,
        userAdded: true,
      });
      message.userReacted = true;
      updatedMessages[messageIndex] = message;

      // Find and remove previous reaction response
      const reactionResponseIndex = updatedMessages.findIndex(
        (msg) =>
          msg.sender === "bot" &&
          msg.isReactionResponse === true &&
          msg.parentMessageId === messageId
      );

      if (reactionResponseIndex !== -1) {
        updatedMessages.splice(reactionResponseIndex, 1);
      }

      // Add a new reaction response message with proper flags
      updatedMessages.push({
        id: Date.now().toString(),
        text: getRandomResponse(reactionType),
        sender: "bot",
        timestamp: new Date(),
        isReactionResponse: true,
        parentMessageId: messageId,
      });

      return updatedMessages;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input field when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const generateQuickReplies = async (
    message: string,
    isInitialGreeting = false,
    hasJustProvidedName = false,
    language = selectedLanguage
  ): Promise<QuickReply[]> => {
    // Don't show suggestions during name question
    if (
      message.includes("What's your name") ||
      message.includes("Could you please tell me your name")
    ) {
      return [];
    }

    // Special case: After name is provided and we show greeting
    if (
      message.includes("Nice to meet you") &&
      message.includes("How can I help you today")
    ) {
      return [
        {
          text: "Tell me more about IntelliBuddy",
          action: () =>
            handleQuickReplyClick("Tell me more about IntelliBuddy"),
        },
        {
          text: "What can you help me with?",
          action: () => handleQuickReplyClick("What can you help me with?"),
        },
      ];
    }

    if (rateLimitInfo.isLimited) {
      return [
        {
          text: "Tell me more",
          action: () => handleQuickReplyClick("Tell me more"),
        },
        {
          text: "Thanks for the info",
          action: () => handleQuickReplyClick("Thanks for the info"),
        },
      ];
    }

    // For all other cases, use AI to generate context-specific suggestions
    try {
      const suggestions = await generateSuggestions(
        message,
        sessionId || "new-session",
        language
      );
      return suggestions.map((text) => ({
        text,
        action: () => handleQuickReplyClick(text),
      }));
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [
        {
          text: "Tell me more",
          action: () => handleQuickReplyClick("Tell me more"),
        },
        {
          text: "Thanks for the info",
          action: () => handleQuickReplyClick("Thanks for the info"),
        },
      ];
    }
  };

  // For API rate limit countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (rateLimitInfo.isLimited && rateLimitInfo.nextAvailable) {
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = rateLimitInfo.nextAvailable!.getTime() - now.getTime();

        if (timeLeft <= 0) {
          // Time's up, reset the rate limit
          setRateLimitInfo({
            isLimited: false,
            message: "",
            countdown: 0,
            nextAvailable: null,
          });
          localStorage.removeItem("intellibuddy-rate-limit"); // Clear from localStorage
        } else {
          // Update the countdown
          const secondsLeft = Math.ceil(timeLeft / 1000);
          setRateLimitInfo((prev) => ({
            ...prev,
            countdown: secondsLeft,
          }));
          // Check again in 1 second
          timer = setTimeout(updateCountdown, 1000);
        }
      };

      // Start the countdown
      updateCountdown();
    }

    // Clean up timer on unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [rateLimitInfo.isLimited, rateLimitInfo.nextAvailable]);

  const copyMessageText = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;

    // Strip markdown from text before copying
    const textToCopy = message.text.replace(/[#*_~`]/g, "");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        // Show copy notification
        setCopyNotification({
          visible: true,
          message: "Message copied to clipboard"
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
          setCopyNotification({
            visible: false,
            message: ""
          });
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
        setCopyNotification({
          visible: true,
          message: "Failed to copy message"
        });

        setTimeout(() => {
          setCopyNotification({
            visible: false,
            message: ""
          });
        }, 3000);
      });

    // Close the context menu
    setContextMenu({
      visible: false,
      top: 0,
      left: 0,
      messageId: null,
    });
  };


  // Reaction emoji mapping
  const REACTION_EMOJIS: Record<ReactionType, string> = {
    heart: "❤️",
    laugh: "😂",
    wow: "😮",
    smile: "😊",
    sad: "😢",
    angry: "😠",
  };

  // Reaction response messages
  const REACTION_RESPONSES: Record<ReactionType, string[]> = {
    heart: [
      "I'm so glad you loved that! 🥰",
      "Thank you for the love! 🥰 Is there anything else you'd like to explore?",
      "I'm happy my response was helpful! ❤️",
    ],
    laugh: [
      "Glad I could bring a smile to your face! 🤭",
      "Happy to hear that was amusing! 😆 Anything else you'd like to know?",
      "Always nice to share a laugh! 😂",
    ],
    smile: [
      "Glad that was helpful! 😊",
      "Thanks for the positive feedback! 😊",
      "I'm happy that was useful for you! 😊",
    ],
    angry: [
      "I apologize if my response wasn't what you needed. How can I improve? 😔",
      "I'm sorry that wasn't helpful. Could you let me know what you're looking for? 😔",
      "I'll try to do better next time. What information would be more useful? 😔",
    ],
    sad: [
      "I'm sorry if my answer wasn't what you expected. 😢 How can I help better?",
      "Let me try to improve on that. 😢 What specific information are you looking for?",
      "I apologize if that wasn't helpful. 😢 Please let me know how I can assist you better.",
    ],
    wow: [
      "I'm glad you found that impressive! 😮",
      "Thank you! I aim to amaze! 😮",
      "Wow indeed! 🤯 If you have more questions, feel free to ask!",
    ],
  };

  // Get a random response from the response array
  const getRandomResponse = (reactionType: ReactionType): string => {
    const responses = REACTION_RESPONSES[reactionType];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (rateLimitInfo.isLimited && rateLimitInfo.nextAvailable) {
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = rateLimitInfo.nextAvailable!.getTime() - now.getTime();

        if (timeLeft <= 0) {
          // Time's up, reset the rate limit
          setRateLimitInfo({
            isLimited: false,
            message: "",
            countdown: 0,
            nextAvailable: null,
          });
        } else {
          // Update the message with remaining time
          const secondsLeft = Math.ceil(timeLeft / 1000);
          setRateLimitInfo((prev) => ({
            ...prev,
            message: `Rate limit reached. Please wait ${secondsLeft} seconds before sending another message.`,
          }));

          // Check again in 1 second
          timer = setTimeout(updateCountdown, 1000);
        }
      };

      // Start the countdown
      timer = setTimeout(updateCountdown, 1000);
    }

    return () => clearTimeout(timer);
  }, [rateLimitInfo.isLimited, rateLimitInfo.nextAvailable]);

  const handleQuickReplyClick = (text: string) => {
    if (!isOnline) {
      // Show an offline message
      const offlineMessage: Message = {
        id: Date.now().toString(),
        text: "You're currently offline. Please check your internet connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, offlineMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
      isQuickReply: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Check rate limit AFTER adding the user message
    if (rateLimitInfo.isLimited) {
      // Show rate limit message when user clicks a quick reply during rate limit
      const rateLimitMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Rate limit reached. Please wait ${rateLimitInfo.countdown} seconds before sending another message.`,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }

    // Set loading state
    setIsLoading(true);

    // Special case handlers
    if (text === "Tell me more about IntelliBuddy") {
      const intelliBuddyInfoMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `# IntelliBuddy Features

IntelliBuddy is a cutting-edge AI assistant powered by Google's Gemini model. It offers numerous advanced features:

* **Context-Aware Conversations**: I remember our conversation history
* **Time-Based Personalized Greetings** that adjust to your local time
* **Multi-Language Support** for communication in 10+ languages
* **Smart Suggestions** based on conversation context
* **Light & Dark Mode** for comfortable viewing
* **Message Reactions** for feedback (try the emoji reactions below!)
* **Rate-Limiting Awareness** for optimal experience
* **Offline Mode Detection** to maintain continuity
* **Personal Information Memory** across sessions
* **Markdown Rendering** for formatted responses
* **Message Copying** for easy sharing
* **Business Knowledge Integration** Tailors responses based on company data

## How can I help you today?`,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          {
            text: "How do you remember context?",
            action: () => handleQuickReplyClick("How do you remember context?"),
          },
          {
            text: "Tell me about language support",
            action: () =>
              handleQuickReplyClick("Tell me about language support"),
          },
        ],
      };

      setMessages((prev) => [...prev, intelliBuddyInfoMessage]);
      setIsLoading(false);
      return;
    } else if (text === "What can you help me with?") {
      const servicesMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `## I can assist you with a variety of tasks:

* **Answering general knowledge questions**
* **Providing information on specific topics**
* **Explaining concepts and ideas**
* **Giving recommendations and suggestions**
* **Helping with creative tasks like writing and brainstorming**
* **Remembering our conversation context and your preferences**
* **Translating between languages**
* **Solving simple calculations and problems**

## I also offer these special features:

* **Time-Based Greetings** - Personalized greetings based on your local time
* **Dark & Light Themes** - Comfortable viewing in any environment
* **Markdown Rendering** - Beautifully formatted responses with lists, headings, and code blocks
* **Message Reactions** - Express your feelings about responses with emoji reactions
* **Quick Reply Suggestions** - Smart contextual suggestions for faster interactions
* **Rate Limit Awareness** - Optimized experience that respects API usage limits
* **Offline Mode Detection** - Automatic notification when your connection is lost
* **Multi-Language Support** - Communication in 12 different languages
* **Context Menu** - Right-click to access reactions or copy message text
* **Business Knowledge Integration** - Tailors responses based on company data

## What specific area would you like assistance with today?`,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          {
            text: "General knowledge question",
            action: () =>
              handleQuickReplyClick("I have a general knowledge question"),
          },
          {
            text: "Help with writing",
            action: () =>
              handleQuickReplyClick("I need help with writing something"),
          },
        ],
      };

      setMessages((prev) => [...prev, servicesMessage]);
      setIsLoading(false);
      return;
    } else if (text === "Tell me more" || text === "Thanks for the info") {
      // Special handling for these generic quick replies
      generateResponse(text, sessionId, true)
        .then((response) => {
          if ("isRateLimitError" in response) {
            // Handle rate limit error
            setRateLimitInfo({
              isLimited: true,
              message: response.message,
              countdown: Math.ceil(
                (response.nextAvailableTime.getTime() - new Date().getTime()) /
                1000
              ),
              nextAvailable: response.nextAvailableTime,
            });

            // Add a rate limit message
            const rateLimitMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.message,
              sender: "bot",
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, rateLimitMessage]);
          } else if ("text" in response && "sessionId" in response) {
            // Regular response
            setSessionId(response.sessionId);

            // Fix any potential "Nice to meet you" issues
            let responseText = response.text;
            if (
              responseText.includes("Nice to meet you") &&
              responseText.includes(text)
            ) {
              responseText = responseText.replace(
                /Nice to meet you,\s+([^!]+)!/g,
                "About $1:"
              );
            }

            // Generate suggestions for the new response
            generateQuickReplies(responseText)
              .then((quickReplies) => {
                const botMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  text: responseText,
                  sender: "bot",
                  timestamp: new Date(),
                  quickReplies: quickReplies,
                };
                setMessages((prev) => [...prev, botMessage]);
              })
              .catch((suggestionsError) => {
                console.error(
                  "Error generating suggestions:",
                  suggestionsError
                );

                // Still add the message even without suggestions
                const botMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  text: responseText,
                  sender: "bot",
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMessage]);
              });
          }
        })
        .catch((error) => {
          console.error("Error getting response:", error);

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error. Please try again later.",
            sender: "bot",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });

      return;
    }

    // For all other quick replies
    generateResponse(text, sessionId, true)
      .then((response) => {
        if ("isRateLimitError" in response) {
          // Handle rate limit error
          setRateLimitInfo({
            isLimited: true,
            message: response.message,
            countdown: Math.ceil(
              (response.nextAvailableTime.getTime() - new Date().getTime()) /
              1000
            ),
            nextAvailable: response.nextAvailableTime,
          });

          // Add a rate limit message
          const rateLimitMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.message,
            sender: "bot",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, rateLimitMessage]);
        } else if ("text" in response && "sessionId" in response) {
          // Store session ID
          setSessionId(response.sessionId);

          // Fix any potential "Nice to meet you" issues
          let responseText = response.text;
          if (
            responseText.includes("Nice to meet you") &&
            responseText.includes(text)
          ) {
            responseText = responseText.replace(
              /Nice to meet you,\s+([^!]+)!/g,
              "I understand you're asking about $1."
            );
          }

          // Generate new suggestions
          generateQuickReplies(responseText)
            .then((quickReplies) => {
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: "bot",
                timestamp: new Date(),
                quickReplies: quickReplies,
              };
              setMessages((prev) => [...prev, botMessage]);
            })
            .catch((suggestionsError) => {
              console.error("Error generating suggestions:", suggestionsError);

              // Still add the message even without suggestions
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: "bot",
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, botMessage]);
            });
        }
      })
      .catch((error) => {
        console.error("Error getting response:", error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUserMessageSubmit = async (message: string) => {
    setIsLoading(true);

    if (message === "What can you help me with?") {
      const servicesMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `## I can assist you with a variety of tasks:

* **Answering general knowledge questions**
* **Providing information on specific topics**
* **Explaining concepts and ideas**
* **Giving recommendations and suggestions**
* **Helping with creative tasks like writing and brainstorming**
* **Remembering our conversation context and your preferences**
* **Translating between languages**
* **Solving simple calculations and problems**

## I also offer these special features:

* **Time-Based Greetings** - Personalized greetings based on your local time
* **Dark & Light Themes** - Comfortable viewing in any environment
* **Markdown Rendering** - Beautifully formatted responses with lists, headings, and code blocks
* **Message Reactions** - Express your feelings about responses with emoji reactions
* **Quick Reply Suggestions** - Smart contextual suggestions for faster interactions
* **Rate Limit Awareness** - Optimized experience that respects API usage limits
* **Offline Mode Detection** - Automatic notification when your connection is lost
* **Multi-Language Support** - Communication in 12 different languages
* **Context Menu** - Right-click to access reactions or copy message text
* **Business Knowledge Integration** - Tailors responses based on company data

## What specific area would you like assistance with today?`,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          {
            text: "General knowledge question",
            action: () =>
              handleQuickReplyClick("I have a general knowledge question"),
          },
          {
            text: "Help with writing",
            action: () =>
              handleQuickReplyClick("I need help with writing something"),
          },
        ],
      };

      setMessages((prev) => [...prev, servicesMessage]);
      setIsLoading(false);
      return;
    }

    if (message === "Tell me more about IntelliBuddy") {
      const intelliBuddyInfoMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `# IntelliBuddy Features

IntelliBuddy is a cutting-edge AI assistant powered by Google's Gemini model. It offers numerous advanced features:

* **Context-Aware Conversations**: I remember our conversation history
* **Time-Based Personalized Greetings** that adjust to your local time
* **Multi-Language Support** for communication in 10+ languages
* **Smart Suggestions** based on conversation context
* **Light & Dark Mode** for comfortable viewing
* **Message Reactions** for feedback (try the emoji reactions below!)
* **Rate-Limiting Awareness** for optimal experience
* **Offline Mode Detection** to maintain continuity
* **Personal Information Memory** across sessions
* **Markdown Rendering** for formatted responses
* **Message Copying** for easy sharing
* **Business Knowledge Integration** Tailors responses based on company data

## How can I help you today?`,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          {
            text: "How do you remember context?",
            action: () => handleQuickReplyClick("How do you remember context?"),
          },
          {
            text: "Tell me about language support",
            action: () =>
              handleQuickReplyClick("Tell me about language support"),
          },
        ],
      };

      setMessages((prev) => [...prev, intelliBuddyInfoMessage]);
      return;
    }

    try {
      const response = await generateResponse(
        message,
        sessionId,
        false,
        selectedLanguage
      );

      if ("isRateLimitError" in response) {
        setRateLimitInfo({
          isLimited: true,
          message: response.message,
          countdown: Math.ceil(
            (response.nextAvailableTime.getTime() - new Date().getTime()) / 1000
          ),
          nextAvailable: response.nextAvailableTime,
        });
        setIsLoading(false);
        return;
      }

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Check if we're in the name gathering phase
      const isNameQuestion = messages.length <= 2 && !sessionId;
      const hasJustProvidedName = messages.length <= 3 && !!sessionId;

      // Generate appropriate quick replies based on context
      const quickReplies = await generateQuickReplies(
        response.text,
        isNameQuestion,
        hasJustProvidedName
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: quickReplies,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    if (!isOnline) {
      // Show an offline message
      const offlineMessage: Message = {
        id: Date.now().toString(),
        text: "You're currently offline. Please check your internet connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, offlineMessage]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      isQuickReply: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    const message = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Check if this might be the first message (name response)
      const isAwaitingName =
        messages.length <= 2 &&
        messages.some(
          (msg) => msg.sender === "bot" && msg.text.includes("What's your name")
        );

      if (isAwaitingName) {
        // Only process as name if we're actually expecting a name
        await handleNameProcessing(message);
        return;
      }

      const lowerInput = message.toLowerCase();

      // Handle special questions
      if (await handleSpecialQuestions(lowerInput)) {
        return;
      }

      // For regular messages, process with the API
      await handleUserMessageSubmit(message);
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process name input
  const handleNameProcessing = async (
    input: string,
    isQuickReplyMessage = false
  ) => {
    if (isQuickReplyMessage) {
      // Process as a normal message instead
      await handleUserMessageSubmit(input);
      return;
    }

    // First, detect if input is likely not a proper name
    const isQuestion = input.includes("?");

    // Check for common non-name inputs using a comprehensive list
    const nonNamePatterns = [
      /^(what|who|how|when|where|why|can|do|is|are|will)/i,
      /^(my|your|his|her|their|our)\s+(name|names)$/i,
      /^(sup|wassup|yo|hey|hi|hello|whats|what's|whatsup|what's up)/i,
    ];

    const containsNonNamePattern = nonNamePatterns.some((pattern) =>
      pattern.test(input.trim())
    );

    // Check if the input contains common slang or informal expressions
    const slangTerms = [
      "dawg",
      "bro",
      "dude",
      "homie",
      "fam",
      "bruh",
      "mate",
      "pal",
      "buddy",
    ];

    const containsSlang = slangTerms.some((term) =>
      input.toLowerCase().includes(term)
    );

    if (isQuestion || containsNonNamePattern || containsSlang) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "That doesn't seem like a name. Could you please tell me your actual name?",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    // Extract name logic - same as before
    let userName = "";
    const namePatterns = [
      /my name is\s+([^\.,!?]+)/i,
      /i am\s+([^\s\.,!?]+)/i,
      /i'm\s+([^\s\.,!?]+)/i,
      /call me\s+([^\.,!?]+)/i,
      /name['']?s\s+([^\.,!?]+)/i,
    ];

    // Try each pattern to extract name
    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        userName = match[1].trim();
        break;
      }
    }

    // If no patterns matched but input is short, consider it a direct name response
    if (!userName && input.length < 20 && !input.includes(" ")) {
      userName = input.trim();
    }

    // Validate the extracted name - same as before
    const invalidNames = [
      "what",
      "who",
      "when",
      "where",
      "why",
      "how",
      "yes",
      "no",
      "maybe",
      "your",
      "you",
      "chatbot",
      "robot",
      "bot",
      "intellibuddy",
      "ok",
      "okay",
      "sure",
      "help",
      "hello",
      "hi",
      "hey",
      "thanks",
      "please",
      "question",
      "name",
      "about",
      "myself",
      "fine",
      "good",
      "my",
      "the",
      "this",
      "that",
      "these",
      "those",
      "a",
      "an",
      "sup",
      "wassup",
      "yo",
      "buddy",
      "man",
      "dude",
      "bro",
      "bruh",
      "dawg",
      "sir",
      "madam",
      "miss",
      "mr",
      "mrs",
      "ms",
    ];

    if (userName) {
      const nameLower = userName.toLowerCase();
      const isInvalid = invalidNames.some(
        (word) =>
          nameLower === word ||
          nameLower.startsWith(word + " ") ||
          nameLower.endsWith(" " + word) ||
          nameLower.includes(" " + word + " ")
      );

      const isTooShort = userName.length < 2;

      if (isInvalid || isTooShort) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "That doesn't look like a name. Please tell me your name so I can address you properly.",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // Valid name found - update session
      if (sessionId) {
        updateUserInfo(sessionId, { name: userName });
      } else {
        // Create new session with name
        const newSession = await generateResponse(input);
        if ("sessionId" in newSession && newSession.sessionId) {
          setSessionId(newSession.sessionId);
          updateUserInfo(newSession.sessionId, { name: userName });
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Nice to meet you, ${userName}! How can I help you today?`,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          {
            text: "Tell me more about IntelliBuddy",
            action: () =>
              handleQuickReplyClick("Tell me more about IntelliBuddy"),
          },
          {
            text: "What can you help me with?",
            action: () => handleQuickReplyClick("What can you help me with?"),
          },
        ],
      };

      setMessages((prev) => [...prev, botMessage]);
    } else {
      // Couldn't extract a valid name
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I didn't catch your name. Could you please tell me what I should call you?",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // Add click outside handler for language dropdown
  useEffect(() => {
    if (isLanguageDropdownOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!(event.target as HTMLElement).closest(".language-selector")) {
          setIsLanguageDropdownOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isLanguageDropdownOpen]);

  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    // Skip if selecting the same language
    if (languageCode === selectedLanguage) {
      setIsLanguageDropdownOpen(false);
      return;
    }

    const now = Date.now();

    // Check if language switching is rate limited
    if (languageRateLimited) {
      // Show rate limit message using the existing rate limit UI
      setRateLimitInfo({
        isLimited: true,
        message: `You can only switch language twice per minute. Please wait ${languageCountdown} seconds.`,
        countdown: languageCountdown,
        nextAvailable: languageLimitReset,
      });

      setIsLanguageDropdownOpen(false);
      return;
    }

    // Check if we've reached the limit (2 switches per minute)
    if (languageSwitchCount >= 2) {
      // Calculate when the limit will reset (60 seconds from first switch)
      const resetTime = new Date(now + 60000);
      const secondsLeft = 60;

      // Set language rate limiting
      setLanguageRateLimited(true);
      setLanguageLimitReset(resetTime);
      setLanguageCountdown(secondsLeft);

      // Also use the main rate limit indicator to show the message
      setRateLimitInfo({
        isLimited: true,
        message: `You can only switch language twice per minute. Please wait ${secondsLeft} seconds.`,
        countdown: secondsLeft,
        nextAvailable: resetTime,
      });

      setIsLanguageDropdownOpen(false);
      return;
    }

    // Increment the switch count
    setLanguageSwitchCount((prev) => prev + 1);

    // If this is the first switch in this period, set up the reset timer
    if (languageSwitchCount === 0) {
      // Schedule reset after 60 seconds
      const resetTime = new Date(now + 60000);
      setLanguageLimitReset(resetTime);

      // Set up a timer to reset the count after 60 seconds
      setTimeout(() => {
        setLanguageSwitchCount(0);
        setLanguageRateLimited(false);
      }, 60000);
    }

    // Set loading state BEFORE attempting translation
    setIsLoading(true);
    setIsLanguageDropdownOpen(false);

    try {
      // Save the new language immediately to localStorage
      localStorage.setItem("intellibuddy-language", languageCode);
      setSelectedLanguage(languageCode);

      // Translate all existing messages
      const translatedMessages = await Promise.all(
        messages.map(async (message) => {
          // Keep user messages as they are
          if (message.sender === "user" && !message.isQuickReply) {
            return message;
          }

          // Translate bot messages and quick replies
          const translatedText = await translateMessage(
            message.text,
            languageCode
          );

          // Also translate quick replies if present
          let translatedQuickReplies = message.quickReplies;
          if (message.quickReplies && message.quickReplies.length > 0) {
            translatedQuickReplies = await Promise.all(
              message.quickReplies.map(async (reply) => {
                const translatedReplyText = await translateMessage(
                  reply.text,
                  languageCode
                );
                return {
                  ...reply,
                  text: translatedReplyText,
                  action: () => handleQuickReplyClick(translatedReplyText),
                };
              })
            );
          }

          return {
            ...message,
            text: translatedText,
            quickReplies: translatedQuickReplies,
            timeOfDay: message.timeOfDay,
          };
        })
      );

      setMessages(translatedMessages);

      // Also update language in the session if exists
      if (sessionId) {
        updateUserInfo(sessionId, { language: languageCode });
      }
    } catch (error) {
      console.error("Error translating messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle special question cases
  const handleSpecialQuestions = async (
    lowerInput: string,
    isQuickReplyMessage = false
  ) => {
    if (isQuickReplyMessage) {
      return false;
    }

    // "What's my name?" handling
    if (
      lowerInput.includes("what") &&
      (lowerInput.includes("my name") || lowerInput.includes("call me"))
    ) {
      if (sessionId) {
        try {
          const response = await generateResponse(
            "The user is asking what their name is. If you know their name from previous context, " +
            "tell them their name politely. If not, tell them you don't know their name yet.",
            sessionId
          );

          if (!("isRateLimitError" in response)) {
            const quickReplies = await generateQuickReplies(response.text);
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.text,
              sender: "bot",
              timestamp: new Date(),
              quickReplies: quickReplies,
            };

            setMessages((prev) => [...prev, botMessage]);
          }
          return true;
        } catch (error) {
          console.error("Error handling name question:", error);
        }
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I don't believe you've told me your name yet. What should I call you?",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        return true;
      }
    }

    // Other identity questions
    if (
      lowerInput.includes("who are you") ||
      (lowerInput.includes("what") && lowerInput.includes("your name"))
    ) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm IntelliBuddy, your AI assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      return true;
    }

    // Tell me more about IntelliBuddy
    if (lowerInput === "tell me more about intellibuddy") {
      handleQuickReplyClick("Tell me more about IntelliBuddy");
      return true;
    }

    // What can you help me with
    if (lowerInput === "what can you help me with?") {
      handleQuickReplyClick("What can you help me with?");
      return true;
    }

    return false;
  };

  const handleClearChat = () => {
    // Only clear if we have a session
    if (sessionId) {
      clearConversation(sessionId);
    }

    // Get welcome message in the current language
    const getWelcomeMessageInCurrentLanguage = async () => {
      const initialText = getFullGreeting();

      // If current language is English, no need to translate
      if (selectedLanguage === "en") {
        return initialText;
      }

      try {
        // Translate the welcome message to the current language
        return await translateMessage(initialText, selectedLanguage);
      } catch (error) {
        console.error("Error translating welcome message:", error);
        return initialText;
      }
    };

    // Use async IIFE to handle the async operation
    (async () => {
      const translatedWelcome = await getWelcomeMessageInCurrentLanguage();

      // Get current time to set the timeOfDay property
      const hour = new Date().getHours();
      let timeOfDay: "morning" | "afternoon" | "evening" | "night";
      if (hour >= 5 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
      else if (hour >= 17 && hour < 19) timeOfDay = "evening";
      else timeOfDay = "night";

      setMessages([
        {
          id: Date.now().toString(),
          text: translatedWelcome,
          sender: "bot",
          timestamp: new Date(),
          timeOfDay: timeOfDay,
        },
      ]);

      // Create a new session with the current language preference
      if (selectedLanguage !== "en") {
        const newSession = await generateResponse(
          "",
          undefined,
          false,
          selectedLanguage
        );
        if ("sessionId" in newSession) {
          setSessionId(newSession.sessionId);
          updateUserInfo(newSession.sessionId, { language: selectedLanguage });
        }
      } else {
        setSessionId("");
      }
    })();

    // Reset reaction state completely
    setActiveTooltipId(null);
    setTooltipMessage(null);

    // Make sure context menu is closed
    setContextMenu({
      visible: false,
      top: 0,
      left: 0,
      messageId: null,
    });
  };

  // Simple mapping of time indicators to all supported languages
  const timeTranslations: Record<string, Record<string, string>> = {
    en: {
      Morning: "Morning",
      Afternoon: "Afternoon",
      Evening: "Evening",
      Night: "Night",
    },
    zh: { Morning: "早上", Afternoon: "下午", Evening: "晚上", Night: "夜晚" },
    hi: { Morning: "सुबह", Afternoon: "दोपहर", Evening: "शाम", Night: "रात" },
    es: {
      Morning: "Mañana",
      Afternoon: "Tarde",
      Evening: "Noche",
      Night: "Noche",
    },
    ar: {
      Morning: "صباح",
      Afternoon: "بعد الظهر",
      Evening: "مساء",
      Night: "ليل",
    },
    fr: {
      Morning: "Matin",
      Afternoon: "Après-midi",
      Evening: "Soir",
      Night: "Nuit",
    },
    ko: { Morning: "아침", Afternoon: "오후", Evening: "저녁", Night: "밤" },
    pt: {
      Morning: "Manhã",
      Afternoon: "Tarde",
      Evening: "Noite",
      Night: "Noite",
    },
    ru: { Morning: "Утро", Afternoon: "День", Evening: "Вечер", Night: "Ночь" },
    ja: { Morning: "朝", Afternoon: "午後", Evening: "夕方", Night: "夜" },
    id: {
      Morning: "Pagi",
      Afternoon: "Siang",
      Evening: "Sore",
      Night: "Malam",
    },
    de: {
      Morning: "Morgen",
      Afternoon: "Nachmittag",
      Evening: "Abend",
      Night: "Nacht",
    },
  };

  const translateTimeOfDay = (
    timeIndicator: string,
    language: string
  ): string => {
    if (language === "en") return timeIndicator;
    return timeTranslations[language]?.[timeIndicator] || timeIndicator;
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Container>
      <AnimatePresence>
        {showReconnected && (
          <ReconnectedNotification
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}>
            <FaCheckCircle /> Connected to Internet
          </ReconnectedNotification>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isOpen && (
          <ChatButton
            key="chat-button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={toggleChat}
            aria-label="Open chat"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}>
            <ButtonImage src={botImage} alt="IntelliBuddy" />
            {!isOnline && <OfflineIndicatorDot />}
          </ChatButton>
        )}

        {isOpen && (
          <ChatWidgetContainer
            className="chat-widget-container"
            key="chat-widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0 } }}
            transition={{ type: "spring", stiffness: 300 }}>
            <ChatHeader>
              <ChatTitle>
                <AvatarImage src={botImage} alt="IntelliBuddy" />
                <span>IntelliBuddy</span>
              </ChatTitle>
              <HeaderButtons>
                <LanguageSelector className="language-selector">
                  <LanguageButton
                    onClick={() =>
                      setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                    }
                    aria-label="Change language"
                    className="language-selector"
                    disabled={!isOnline}>
                    {SUPPORTED_LANGUAGES.find(
                      (lang) => lang.code === selectedLanguage
                    )?.flag || "🇬🇧"}
                    <span className="language-code">
                      {selectedLanguage.toUpperCase()}
                    </span>
                  </LanguageButton>
                  <LanguageDropdown
                    isOpen={isLanguageDropdownOpen}
                    className="language-dropdown">
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <LanguageOption
                        key={language.code}
                        isSelected={selectedLanguage === language.code}
                        onClick={() => handleLanguageChange(language.code)}>
                        <span className="flag">{language.flag}</span>
                        <span className="language-code">
                          {language.code.toUpperCase()}
                        </span>
                      </LanguageOption>
                    ))}
                  </LanguageDropdown>
                </LanguageSelector>

                <OnlineStatusIndicator online={isOnline}>
                  {isOnline ? "Online" : "Offline"}
                </OnlineStatusIndicator>

                <HeaderButton onClick={handleClearChat} aria-label="Clear chat">
                  <FaTrash />
                </HeaderButton>
                <HeaderButton onClick={toggleChat} aria-label="Close chat">
                  <FaTimes />
                </HeaderButton>
              </HeaderButtons>
            </ChatHeader>

            <ChatMessages className="chat-messages">
              {messages.map((message) => (
                <MessageRow key={message.id} isUser={message.sender === "user"}>
                  {message.sender === "bot" && (
                    <BotAvatar>
                      <AvatarImage src={botImage} alt="IntelliBuddy" />
                    </BotAvatar>
                  )}
                  <MessageBubble
                    isUser={message.sender === "user"}
                    className="message-bubble"
                    onContextMenu={(e) => handleContextMenu(e, message.id)}
                    onTouchStart={(e) => handleTouchStart(e, message.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                  >
                    {message.sender === "bot" &&
                      message.timeOfDay === "morning" && (
                        <TimeIndicator>
                          <TimeIcon>☀️</TimeIcon>{" "}
                          {selectedLanguage === "en"
                            ? "Morning"
                            : translateTimeOfDay("Morning", selectedLanguage)}
                        </TimeIndicator>
                      )}
                    {message.sender === "bot" &&
                      message.timeOfDay === "afternoon" && (
                        <TimeIndicator>
                          <TimeIcon>🌤️</TimeIcon>{" "}
                          {selectedLanguage === "en"
                            ? "Afternoon"
                            : translateTimeOfDay("Afternoon", selectedLanguage)}
                        </TimeIndicator>
                      )}
                    {message.sender === "bot" &&
                      message.timeOfDay === "evening" && (
                        <TimeIndicator>
                          <TimeIcon>🌇</TimeIcon>{" "}
                          {selectedLanguage === "en"
                            ? "Evening"
                            : translateTimeOfDay("Evening", selectedLanguage)}
                        </TimeIndicator>
                      )}
                    {message.sender === "bot" &&
                      message.timeOfDay === "night" && (
                        <TimeIndicator>
                          <TimeIcon>🌙</TimeIcon>{" "}
                          {selectedLanguage === "en"
                            ? "Night"
                            : translateTimeOfDay("Night", selectedLanguage)}
                        </TimeIndicator>
                      )}

                    <MessageText>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </MessageText>

                    {/* Display emoji reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <DisplayedReactions>
                        {message.reactions.map((reaction) => (
                          <ReactionDisplay key={reaction.type}>
                            {REACTION_EMOJIS[reaction.type]}
                          </ReactionDisplay>
                        ))}
                      </DisplayedReactions>
                    )}

                    <MessageTime>{formatTime(message.timestamp)}</MessageTime>

                    {message.sender === "bot" &&
                      message.quickReplies &&
                      message.quickReplies.length > 0 && (
                        <QuickRepliesContainer>
                          {message.quickReplies.map((reply, index) => (
                            <QuickReplyButton
                              key={`${message.id}-reply-${index}`}
                              onClick={reply.action}>
                              {reply.text}
                            </QuickReplyButton>
                          ))}
                        </QuickRepliesContainer>
                      )}
                  </MessageBubble>
                </MessageRow>
              ))}

              {isLoading && (
                <MessageRow isUser={false}>
                  <BotAvatar>
                    <AvatarImage src={botImage} alt="IntelliBuddy" />
                  </BotAvatar>
                  <TypingIndicator>
                    <TypingDot delay="0s" />
                    <TypingDot delay="0.2s" />
                    <TypingDot delay="0.4s" />
                  </TypingIndicator>
                </MessageRow>
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatForm onSubmit={handleSubmit}>
              {!isOnline && (
                <OfflineIndicator>
                  <FaWifi />
                  <span>
                    You are offline. Messages cannot be sent until your
                    connection is restored.
                  </span>
                </OfflineIndicator>
              )}
              {copyNotification.visible && (
                <CopyNotification>
                  <FaCheckCircle />
                  <span>{copyNotification.message}</span>
                </CopyNotification>
              )}
              {rateLimitInfo.isLimited && (
                <RateLimitIndicator>
                  <FaExclamationCircle />
                  <RateLimitText>
                    Rate limit reached. Please wait{" "}
                    <RateLimitCounter>
                      {rateLimitInfo.countdown}
                    </RateLimitCounter>{" "}
                    seconds.
                  </RateLimitText>
                </RateLimitIndicator>
              )}

              <ChatInput
                ref={inputRef}
                type="text"
                placeholder={
                  !isOnline
                    ? "You're offline..."
                    : rateLimitInfo.isLimited
                      ? "Please wait..."
                      : "Type your message..."
                }
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                  if (contextMenu.visible) {
                    setContextMenu({
                      visible: false,
                      top: 0,
                      left: 0,
                      messageId: null,
                    });
                  }
                }}
                disabled={isLoading || rateLimitInfo.isLimited || !isOnline}
              />

              <SendButton
                type="submit"
                disabled={
                  !inputValue.trim() ||
                  isLoading ||
                  rateLimitInfo.isLimited ||
                  !isOnline
                }
                aria-label="Send message">
                <FaPaperPlane />
              </SendButton>
            </ChatForm>
          </ChatWidgetContainer>
        )}
      </AnimatePresence>
      {/* Context Menu for Reactions */}
      {contextMenu.visible && (
        <ReactionContextMenu
          ref={contextMenuRef}
          top={contextMenu.top}
          left={contextMenu.left}
        >
          {/* Add Copy option first */}
          <CopyOption onClick={() => copyMessageText(contextMenu.messageId!)}>
            <FaCopy /> Copy
          </CopyOption>

          {contextMenu.sender === 'bot' && (
            <>
              <MenuDivider />
              <ReactionsRow>
                {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                  <ReactionOption
                    key={type}
                    onClick={() => handleReaction(contextMenu.messageId!, type as ReactionType)}
                  >
                    {emoji}
                  </ReactionOption>
                ))}
              </ReactionsRow>
            </>
          )}
        </ReactionContextMenu>
      )}
    </Container>
  );
};

// Add these new styled components
const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
    
`;

// Styled components
const Container = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  font-family: var(--font-body);
`;

const ChatButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  position: absolute;
  bottom: 10px;
  right: 10px;
  transition: background-color 0.3s ease;

  media (max-width: 576px) {
    width: 60px;
    height: 60px;
`;

const ButtonImage = styled.img`
  width: 110%;
  height: 110%;
  object-fit: contain;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  background-color: ${(props) =>
    props.theme.name === "dark" ? "transparent" : "rgba(255,255,255,0.15)"};
  border-radius: 100%;
  border: ${(props) =>
    props.theme.name === "dark" ? "1px solid rgba(255,255,255,0.2)" : "none"};
`;

const ChatWidgetContainer = styled(motion.div)`
  width: 420px;
  height: 550px;
  background-color: ${(props) => props.theme.colors.cardBg};
  border-radius: 16px;
  box-shadow: ${(props) => props.theme.colors.shadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  right: 0;
  transition: background-color 0.3s ease;

  @media (max-width: 576px) {
    width: 100vw; /* Full width on mobile */
    height: 60vh; /* Full height on mobile */
    position: fixed;
  }

  @media (max-width: 380px) {
    width: 100vw; /* Full width on mobile */
    height: 60vh; /* Full height on mobile */
    position: fixed;
  }

  @media (max-height: 650px) {
    height: 100vh; /* Adjust height for smaller screens */
  }

  @media (max-height: 550px) {
    height: 100vh;
  }
`;

const ChatHeader = styled.div`
  background-color: ${(props) =>
    props.theme.name === "dark" ? "#0d3b39" : props.theme.colors.primary};
  color: white;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 576px) {
    padding: 8px;
    align-items: flex-start;
  }
  @media (max-width: 380px) {
    padding: 8px;
    align-items: flex-start;
  }
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-size: 1.1rem;

  & > img {
    width: 28px;
    height: 28px;
  }
`;

const DisplayedReactions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 6px;
`;

const ReactionDisplay = styled.span`
  font-size: 16px;
  background-color: ${(props) => props.theme.colors.background}50;
  border-radius: 12px;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
`;

const TimeIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.copyright};
`;

const TimeIcon = styled.span`
  margin-right: 5px;
  font-size: 0.9rem;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: ${(props) => props.theme.colors.chatBg};
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.border};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const MessageRow = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const BotAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f1f1f1;
`;
const LanguageSelector = styled.div`
  position: relative;
  margin-right: 10px;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: white;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: ${(props) => (props.disabled ? "0.5" : "1")};

  &:hover {
    background-color: ${(props) =>
    props.disabled ? "transparent" : "rgba(255, 255, 255, 0.1)"};
  }
`;

const LanguageDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 140px;
  background-color: ${(props) => props.theme.colors.cardBg};
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.isOpen ? "translateY(0)" : "translateY(-10px)"};
  transition: all 0.2s ease;
  z-index: 1100;

  /* Adding scroll functionality */
  max-height: 200px; /* Limits height to show ~4 items */
  overflow-y: auto; /* Enables vertical scrolling */

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.accent};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* For Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.accent} transparent;
`;

const CopyNotification = styled.div`
  position: absolute;
  top: -82px;
  left: 16px;
  right: 16px;
  background-color: ${props => props.theme.name === 'dark' ? '#1e3a2e' : '#edf7ed'};
  color: ${props => props.theme.name === 'dark' ? '#4caf50' : '#2e7d32'};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.name === 'dark' ? '#2e7d32' : '#c8e6c9'};
  animation: slideIn 0.3s ease-out;
  
  svg {
    color: ${props => props.theme.name === 'dark' ? '#4caf50' : '#2e7d32'};
    font-size: 1.1rem;
  }
`;


const LanguageOption = styled.button<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background-color: ${(props) =>
    props.isSelected ? `${props.theme.colors.primary}20` : "transparent"};
  color: ${(props) => props.theme.colors.text};
  text-align: left;
  cursor: pointer;
  height: 40px; /* Fixed height for consistent sizing */

  &:hover {
    background-color: ${(props) => props.theme.colors.accent}15;
  }

  .flag {
    font-size: 1.2rem;
  }

  .language-code {
    font-weight: ${(props) => (props.isSelected ? "bold" : "normal")};
    font-size: 0.8rem;
    color: ${(props) =>
    props.isSelected ? props.theme.colors.primary : props.theme.colors.text};
  }
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  &.message-bubble {
    position: relative;
  }
  background-color: ${(props) =>
    props.isUser
      ? props.theme.colors.messageBubbleUser
      : props.theme.colors.messageBubbleBot};
  color: ${(props) =>
    props.isUser
      ? props.theme.colors.messageTextUser
      : props.theme.colors.messageTextBot};
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-${(props) => (props.isUser ? "right" : "left")}-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 75%;
  display: flex;
  flex-direction: column;
`;

// Add these components to ChatbotWidget.tsx

// Context Menu for Reactions
const ReactionContextMenu = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  background-color: ${(props) => props.theme.colors.cardBg};
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  padding: 8px;
  z-index: 1100;
  border: 1px solid ${(props) => props.theme.colors.border};
  animation: fadeIn 0.1s ease-out;
  display: flex;
  flex-direction: column;
  min-width: 200px;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ReactionOption = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent}15;
    transform: scale(1.15);
  }
`;

const CopyOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent}15;
  }

  svg {
    font-size: 14px;
    color: ${(props) => props.theme.colors.accent};
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: ${(props) => props.theme.colors.border};
  margin: 4px 0 8px;
  width: 100%;
`;

const ReactionsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const MessageText = styled.div`
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-line;

  /* Markdown styles */
  ul,
  ol {
    padding-left: 20px;
    margin: 0.5em 0;
  }

  code {
    background-color: ${(props) =>
    props.theme.name === "dark" ? "#2a2a2a" : "#f5f5f5"};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85em;
  }

  pre {
    background-color: ${(props) =>
    props.theme.name === "dark" ? "#2a2a2a" : "#f5f5f5"};
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5em 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5em 0;
    font-size: 0.9em;
  }

  th,
  td {
    border: 1px solid
      ${(props) => (props.theme.name === "dark" ? "#444" : "#ddd")};
    padding: 6px 8px;
  }

  th {
    background-color: ${(props) =>
    props.theme.name === "dark" ? "#333" : "#f0f0f0"};
  }

  blockquote {
    border-left: 3px solid ${(props) => props.theme.colors.copyright};
    margin: 0.5em 0;
    padding-left: 1em;
    color: ${(props) => props.theme.colors.copyright};
  }

  h1 {
    margin: 0.5em 0;
    line-height: 1.3;
    font-size: 1.3em;
    color: ${(props) => props.theme.colors.copyright};
  }

  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0.5em 0.5em;
    line-height: 1.3;
    font-size: 1em;
    color: ${(props) => props.theme.colors.copyright};
  }

  a {
    color: ${(props) => props.theme.colors.copyright};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 4px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: ${(props) => props.theme.colors.messageBubbleBot};
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 75%;
`;

const OfflineIndicatorDot = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e74c3c;
  border: 2px solid var(--background);
`;

const TypingDot = styled.div<{ delay: string }>`
  width: 8px;
  height: 8px;
  background-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
  animation-delay: ${(props) => props.delay};

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const ChatForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: ${(props) => props.theme.colors.cardBg};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  position: relative;

  @media (max-width: 576px) {
    padding: 8px;
    gap: 6px;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  border: 1px solid ${(props) => props.theme.colors.inputBorder};
  border-radius: 24px;
  padding: 12px 16px;
  font-size: 0.95rem;
  outline: none;
  background-color: ${(props) => props.theme.colors.inputBg};
  color: ${(props) => props.theme.colors.inputText};
  transition: all 0.2s ease;

  &:focus {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.accent}33;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.text}99;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.accent};
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const QuickReplyButton = styled.button`
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) =>
    props.theme.colors.copyright}; // Use accent color for text
  border: 1px solid ${(props) => props.theme.colors.accent}; // Match border to accent
  border-radius: 20px; // Slightly more rounded
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: normal;
  max-width: 250px;
  text-align: center;
  margin: 4px 2px;
  line-height: 1.2;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent}15;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const QuickRepliesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
  margin-bottom: 6px;
  justify-content: flex-start;
  width: 100%;
`;

const RateLimitIndicator = styled.div`
  position: absolute;
  top: -82px;
  left: 16px;
  right: 16px;
  background-color: ${(props) =>
    props.theme.name === "dark" ? "#2c3e50" : "#f8f9fa"};
  color: ${(props) => (props.theme.name === "dark" ? "#e74c3c" : "#c0392b")};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid
    ${(props) => (props.theme.name === "dark" ? "#34495e" : "#e6e6e6")};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  svg {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 1.1rem;
  }
`;

const OfflineIndicator = styled.div`
  position: absolute;
  top: -82px;
  left: 16px;
  right: 16px;
  background-color: ${(props) =>
    props.theme.name === "dark" ? "#2c3e50" : "#f8f9fa"};
  color: ${(props) => (props.theme.name === "dark" ? "#e74c3c" : "#c0392b")};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid
    ${(props) => (props.theme.name === "dark" ? "#34495e" : "#e6e6e6")};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  svg {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 1.1rem;
  }
`;

const OnlineStatusIndicator = styled.div<{ online: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: ${(props) => (props.online ? "#27ae60" : "#e74c3c")};
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${(props) => props.theme.colors.cardBg};
  margin-right: 8px;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => (props.online ? "#27ae60" : "#e74c3c")};
    animation: ${(props) => (props.online ? "none" : "blink 1s infinite")};
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
`;

const ReconnectedNotification = styled(motion.div)`
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #27ae60;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1010;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RateLimitText = styled.span`
  flex: 1;
`;

const RateLimitCounter = styled.span`
  font-weight: bold;
  color: ${(props) => props.theme.colors.secondary};
`;

export default ChatbotWidget;
