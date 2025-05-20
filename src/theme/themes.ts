export interface ThemeType {
  name: string;
  colors: {
    text: string;
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    cardBg: string;
    shadow: string;
    border: string;
    chatBg: string;
    messageBubbleUser: string;
    messageBubbleBot: string;
    messageTextUser: string;
    messageTextBot: string;
    inputBg: string;
    inputBorder: string;
    buttonText: string;
    inputText: string;
    footer: string;
    copyright: string;
  };
}

export const lightTheme: ThemeType = {
  name: 'light',
  colors: {
    text: '#2f2f2f',
    background: '#f7fff7',
    primary: '#1a535c',
    secondary: '#ff6b6b',
    accent: '#4ecdc4',
    cardBg: '#ffffff',
    shadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '#e0e0e0',
    chatBg: '#f8f9fa',
    messageBubbleUser: '#1a535c',
    messageBubbleBot: '#ffffff',
    messageTextUser: '#ffffff',
    messageTextBot: '#2f2f2f',
    inputBg: '#ffffff',
    inputBorder: '#e0e0e0',
    buttonText: '#ffffff',
    inputText: '#000',
    footer: '#f7fff7',
    copyright: '#1a535c'
  }
};

export const darkTheme: ThemeType = {
  name: 'dark',
  colors: {
    text: '#e1e1e1',
    background: '#0a1a1c',
    primary: '#4ecdc4',
    secondary: '#ff6b6b', 
    accent: '#1a535c',
    cardBg: '#142a2d',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: '#1d3c40',
    chatBg: '#142a2d',
    messageBubbleUser: '#4ecdc4',
    messageBubbleBot: '#1d3c40',
    messageTextUser: '#0a1a1c',
    messageTextBot: '#e1e1e1',
    inputBg: '#1d3c40',
    inputBorder: '#2a4b4f',
    buttonText: '#ffffff',
    inputText: '#fff',
    footer: '#0a1a1c',
    copyright: '#ffffff'
  }
};
