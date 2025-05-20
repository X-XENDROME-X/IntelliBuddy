import { css } from 'styled-components';
import { ThemeType } from '../theme/themes';

export const cssVariables = (theme: ThemeType) => css`
  :root {
    --text: ${theme.colors.text};
    --background: ${theme.colors.background};
    --primary: ${theme.colors.primary};
    --secondary: ${theme.colors.secondary};
    --accent: ${theme.colors.accent};
    --card-bg: ${theme.colors.cardBg};
    --shadow: ${theme.colors.shadow};
    --border-radius: 12px;
    --transition: all 0.3s ease;
    --font-heading: 'Poppins', sans-serif;
    --font-body: 'Inter', sans-serif;
  }
`;
