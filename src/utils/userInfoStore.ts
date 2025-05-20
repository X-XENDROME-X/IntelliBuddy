interface UserInfo {
  name?: string;
  preferences?: Record<string, any>;
  context: Record<string, any>;
}

// In-memory store (lasts until page refresh)
let userInfo: UserInfo = {
  context: {}
};

export const getUserInfo = (): UserInfo => {
  return userInfo;
};

export const setUserName = (name: string): void => {
  userInfo.name = name;
  // Also save to localStorage for persistence across page refresh
  saveToLocalStorage();
};

export const addToContext = (key: string, value: any): void => {
  userInfo.context[key] = value;
  saveToLocalStorage();
};

export const clearUserInfo = (): void => {
  userInfo = { context: {} };
  localStorage.removeItem('intellibuddy_user_info');
};

// Save to localStorage
const saveToLocalStorage = (): void => {
  try {
    localStorage.setItem('intellibuddy_user_info', JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving user info to localStorage:', error);
  }
};

// Load from localStorage on initialization
const loadFromLocalStorage = (): void => {
  try {
    const savedInfo = localStorage.getItem('intellibuddy_user_info');
    if (savedInfo) {
      userInfo = JSON.parse(savedInfo);
    }
  } catch (error) {
    console.error('Error loading user info from localStorage:', error);
  }
};

// Initialize by loading from localStorage
loadFromLocalStorage();
