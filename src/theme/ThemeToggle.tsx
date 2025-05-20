import React from 'react';
import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDarkMode ? <FaSun /> : <FaMoon />}
      <ToggleText>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</ToggleText>
    </ToggleButton>
  );
};

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const ToggleText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

export default ThemeToggle;
