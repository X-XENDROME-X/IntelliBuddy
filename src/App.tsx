import React from 'react';
import MainPage from './components/MainPage';
import ChatbotWidget from './components/ChatbotWidget';
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <MainPage />
      <ChatbotWidget />
    </ThemeProvider>
  );
}

export default App;
