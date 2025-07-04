<h1 align="center"> IntelliBuddy 🤖 </h1>

<p align="center">
  <img src="src/assets/bot-image.png" alt="IntelliBuddy Logo" width="300" />
</p>

IntelliBuddy is an advanced AI-powered Assistant built with React, TypeScript, Node.js, Express.js  and Google's Gemini API. It offers a rich, interactive conversational experience with cutting-edge features like context-awareness, multilingual support, and adaptive theming. Designed to showcase modern frontend development techniques, AI integration, and cloud deployment practices, IntelliBuddy demonstrates sophisticated state management, responsive design, containerization with Docker, and Azure cloud hosting.

---

## 🚀 Live Demo

**Live Application**: [https://intellibuddy-app-unique.azurewebsites.net](https://intellibuddy-app-unique.azurewebsites.net)

*Experience IntelliBuddy in action - no installation required! The app is hosted on Azure App Service with Docker containerization.*

---

## 🌟 Features

### Core Intelligence

- **Context-Aware Conversations**: Maintains conversation history to provide coherent, contextually relevant responses
- **Personal Information Memory**: Remembers user details like names across sessions for personalized interactions
- **Time-Based Greetings**: Automatically adjusts greetings based on user's local time (morning, afternoon, evening, night)
- **Smart Suggestion System**: Offers contextually relevant quick reply options based on the current conversation

### User Experience

- **Elegant Theme System**: Switch seamlessly between light and dark modes with smooth transitions
- **Message Reactions**: Express emotions through emoji reactions (❤️, 😂, 😮, 😊, 😠, 😢) with custom bot responses
- **Right-Click Context Menu**: Access reactions and copy functionality through an intuitive context menu
- **Multi-Language Support**: Communicate in 12 languages with real-time translation:
  - English 🇬🇧, Spanish 🇪🇸, Hindi 🇮🇳, Chinese 🇨🇳, French 🇫🇷
  - Arabic 🇸🇦, Japanese 🇯🇵, Portuguese 🇵🇹, Russian 🇷🇺
  - Korean 🇰🇷, Indonesian 🇮🇩, German 🇩🇪
- **Markdown Rendering**: Beautiful formatting of responses with support for headings, lists, code blocks, and tables
- **Message Copy Feature**: Copy conversation text to clipboard with a single click

### Technical Excellence

- **Rate Limit Management**: Sophisticated handling of API limits with user-friendly notifications
- **Persistent Rate Limiting**: Rate limit states persist across page refreshes for proper API quota management
- **Offline Detection**: Automatically detects when users lose connectivity with appropriate UI feedback
- **Responsive Design**: Fully responsive interface that works beautifully on any device
- **Cloud Deployment**: Production-ready deployment on Microsoft Azure with container orchestration

## 🛠️ Technologies Used

### Frontend Framework & Libraries
- **React 18**: Component-based UI library for building the user interface
- **TypeScript**: Strongly typed programming language for safer code
- **Vite**: Next-generation frontend build tool for fast development
- **Styled Components**: CSS-in-JS library for component-based styling
- **Framer Motion**: Animation library for smooth transitions and effects
- **React Icons**: Icon components for enhanced UI elements
- **React Markdown**: Markdown parser and renderer for formatted content


### Backend
- **Node.js**: JavaScript runtime environment for server-side execution
- **Express.js**: Fast, unopinionated web framework for Node.js
- **CORS**: Cross-Origin Resource Sharing for secure frontend-backend communication
- **Helmet**: Security middleware for Express applications

### State Management
- **React Context API**: For global state management like theme and language preferences
- **Custom Hooks**: For reusable stateful logic (online status, language switching)
- **LocalStorage**: For persisting user preferences and conversation data

### API Integration
- **Google Generative AI**: Integration with Google's Gemini API for AI-powered conversations
- **RESTful Principles**: For structured communication with backend services

### Containerization & Cloud Deployment
- **Docker**: Platform for containerising the application, ensuring consistency across environments
- **Docker Compose**: Multi-container orchestration for local development
- **Azure Container Registry**: Cloud-hosted container registry for storing Docker images
- **Azure App Service**: Platform-as-a-Service for hosting web applications with auto-scaling

### Development Tools
- **Node.js**: JavaScript runtime environment for development
- **npm**: Package manager for JavaScript dependencies
- **ESLint**: For code linting and ensuring consistent code quality
- **TypeScript Compiler**: For type checking and transpilation
- **CSS Modules**: For component-scoped styling
- **Azure CLI**: Command-line interface for Azure resource management

## 🌐 Deployment Architecture

IntelliBuddy is deployed using a modern containerized architecture on Microsoft Azure:

###  Infrastructure
- **Azure App Service**: Hosts the containerized React application.
- **Azure Container Registry**: Stores and manages Docker images securely
- **Azure Resource Group**: Logical container for organizing related Azure resources

### Deployment Pipeline
1. **Containerization**: Application is packaged using Docker with optimized multi-stage builds
2. **Registry Push**: Docker images are pushed to Azure Container Registry
3. **Service Deployment**: Azure App Service pulls and runs the latest container image
4. **Auto-scaling**: Azure automatically handles traffic spikes and resource management

## 📂 Project Structure

```
INTELLIBUDDY/
├── node_modules/                # Project dependencies
├── server/                      # Server-side code
│   └── node_modules/            # Server dependencies
├── src/
│   ├── assets/                  # Images and visual resources
│   ├── components/              # React components
│   │   ├── ChatbotWidget.tsx    # Main chatbot interface
│   │   └── MainPage.tsx         # Landing page component
│   ├── controllers/             # Request handling logic
│   ├── models/                  # Data models for conversations
│   ├── routes/                  # API route definitions
│   ├── services/                # Service integrations
│   ├── styles/                  # Global styles
│   ├── theme/                   # Theme definitions and context
│   ├── utils/                   # Utility functions
│   │   ├── contextManager.ts    # Conversation context handling
│   │   ├── geminiApi.ts         # Gemini API integration
│   │   ├── languageDetection.ts # Language detection utilities
│   │   ├── rateLimiter.ts       # API rate limit management
│   │   └── useOnlineStatus.ts   # Network connectivity detection
│   ├── App.tsx                  # Main application component
│   └── main.tsx                 # Application entry point
├── .env                         # Environment variables
├── .env.example                 # Example environment file
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎯 Key Features In-Depth

### Intelligent Conversation Management

IntelliBuddy uses advanced context management to maintain coherent conversations. It remembers previous messages, understands user preferences, and builds a comprehensive context for each API call to ensure responses are relevant and personalized.

### Dynamic Theming System

The theming system provides a seamless transition between light and dark modes. Using styled-components with ThemeProvider, the theme changes are applied instantly across the entire application, affecting colors, shadows, and visual elements for optimal viewing comfort.

### Advanced Language Support

The language system allows users to switch between 12 languages with intelligent rate limiting to prevent API abuse. All UI elements, messages, and bot responses are translated in real-time, maintaining conversation flow even when switching languages mid-discussion.

### Smart Rate Limiting

IntelliBuddy implements sophisticated rate limiting for both API calls and language switching:
- Tracks requests per minute and per day
- Shows countdown timers for rate limits
- Persists rate limit information across page refreshes
- Provides clear visual feedback when limits are reached

### Interactive Message Features

Messages in IntelliBuddy are enriched with:
- Contextual quick reply suggestions that adapt to the conversation
- Emoji reactions with corresponding bot responses
- Right-click context menu for reactions and text copying
- Markdown rendering for beautiful formatting of complex content

## ✅ Prerequisites

Before running IntelliBuddy, ensure you have:

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [npm](https://www.npmjs.com/) (v7.0.0 or higher)
- [Docker](https://docs.docker.com/get-docker/) (for containerization)
- A [Google Generative AI API key](https://makersuite.google.com/app/apikey) for the Gemini model

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/X-XENDROME-X/intellibuddy.git
   cd intellibuddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`


## 🐳 Docker Commands

1. **Start development environment**
   ```bash
   docker-compose up --build
   ```

2. **Start in background**
   ```bash
   docker-compose up --build -d
   ```

## 🧪 Usage

IntelliBuddy provides an intuitive chat interface that allows you to:

- Chat naturally with the AI assistant about various topics
- Ask questions and receive informative, context-aware responses
- Switch between multiple languages for global accessibility
- Use quick reply suggestions for faster interactions
- React to messages with emoji reactions
- Toggle between light and dark themes
- Test the connection awareness with offline mode simulation

## 🔍 Advanced Features Showcase

### Contextual Memory

IntelliBuddy remembers not only the conversation history but also extracts and maintains user information like names and preferences. This allows for a more personalized interaction over time.

### Time-Aware Interface

The Assistant detects your local time and adjusts greetings accordingly, showing appropriate morning, afternoon, evening, or night messages with matching icons.

### Emoji Reaction System

Right-click on any bot message to access the reaction menu. Each emoji triggers a unique response from the bot that matches the emotional context of your reaction.

### Rate Limit Visualization

When approaching API rate limits, IntelliBuddy shows a countdown timer and clear visual feedback, ensuring users understand why responses might be delayed and when normal service will resume.

## 🛠️ Environment Setup

To run IntelliBuddy, add these environment variables to your `.env` file:

```
# Google Generative AI API Key
VITE_GEMINI_API_KEY=your_api_key_here

# Optional configuration
VITE_APP_NAME=IntelliBuddy
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help improve IntelliBuddy:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes and commit them:** `git commit -m 'Add some amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a pull request**

Please ensure your code follows the existing style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

