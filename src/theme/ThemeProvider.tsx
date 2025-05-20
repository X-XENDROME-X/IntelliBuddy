import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, ThemeType } from './themes';
import { GlobalStyle } from './globalStyle';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check for saved theme preference or use device preference
  const getInitialTheme = (): boolean => {
    const savedTheme = localStorage.getItem('intellibuddy-dark-mode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('intellibuddy-dark-mode', String(isDarkMode));
    // Add/remove dark-mode class from body for any CSS that needs it
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDarkMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyle theme={currentTheme} />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
