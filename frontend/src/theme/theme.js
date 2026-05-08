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
});

export default theme;
