import { createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'forest',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',

  colors: {
    forest: [
      '#f0f5ea', '#d9e8c8', '#c2daa6', '#abcc84', '#8fbe62',
      '#628141', '#527036', '#415f2b', '#314e20', '#213d15',
    ],
    sage: [
      '#f4f8ee', '#e2edcf', '#cfe2b0', '#bcd791', '#a9cc72',
      '#8BAE66', '#769755', '#618044', '#4c6933', '#375222',
    ],
  },

  components: {
    AppShell: {
      styles: {
        navbar: { backgroundColor: '#1B211A' },
      },
    },
    NavLink: {
      styles: (theme, { active }) =>
        active
          ? {
              root: {
                borderLeft: '3px solid #628141',
                color: '#8BAE66',
                backgroundColor: 'rgba(98,129,65,0.15)',
              },
            }
          : {},
    },
    Button: {
      styles: (theme, { variant }) =>
        variant === 'filled'
          ? {
              root: {
                backgroundColor: '#628141',
                color: '#fff',
                '&:hover': { backgroundColor: '#8BAE66' },
              },
            }
          : {},
    },
    Paper: {
      defaultProps: {
        style: { backgroundColor: 'rgba(224,217,217,0.6)' },
      },
    },
  },
});

export default theme;
