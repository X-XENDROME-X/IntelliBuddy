import { createGlobalStyle } from 'styled-components';
import { ThemeType } from './themes';

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  * {
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }

  button {
    font-family: 'Inter', sans-serif;
    cursor: pointer;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    color: ${props => props.theme.colors.primary};
  }
  
  img {
    transition: filter 0.3s ease;
    filter: ${props => props.theme.name === 'dark' ? 'brightness(0.9)' : 'none'};
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`;
