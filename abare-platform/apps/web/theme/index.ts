import { createTheme, MantineColorsTuple } from '@mantine/core';
import { CustomTheme } from './types';

const darkBlue: MantineColorsTuple = [
  '#E7F0FF',
  '#C7D9F2',
  '#A6C1E4',
  '#84A9D7',
  '#6391C9',
  '#4379BC',
  '#1F61AF',
  '#154C91',
  '#0B3773',
  '#022356',
  '#011330', // Darkest shade - used for background
];

const neonBlue: MantineColorsTuple = [
  '#E6F7FF',
  '#BAE7FF',
  '#91D5FF',
  '#69C0FF',
  '#40A9FF',
  '#1890FF',
  '#096DD9',
  '#0050B3',
  '#003A8C',
  '#002766',
];

const neonPurple: MantineColorsTuple = [
  '#F9F0FF',
  '#EFDBFF',
  '#D3ADF7',
  '#B37FEB',
  '#9254DE',
  '#722ED1',
  '#531DAB',
  '#391085',
  '#22075E',
  '#120338',
];

export const theme: CustomTheme = {
  primaryColor: 'neonBlue',
  colors: {
    darkBlue,
    neonBlue,
    neonPurple,
  },
  fontFamily: 'Inter, sans-serif',
  primaryShade: { light: 6, dark: 5 },
  white: '#FFFFFF',
  black: '#011330',
  defaultRadius: 'md',
  components: {
    Card: {
      defaultProps: {
        bg: 'darkBlue.9',
      },
    },
    Paper: {
      defaultProps: {
        bg: 'darkBlue.9',
      },
    },
    Button: {
      defaultProps: {
        variant: 'gradient',
        gradient: { from: 'neonBlue.6', to: 'neonPurple.6', deg: 45 },
      },
    },
    Title: {
      defaultProps: {
        c: 'white',
      },
    },
    Text: {
      defaultProps: {
        c: 'gray.3',
      },
    },
  },
  other: {
    backgroundGradient: 'linear-gradient(135deg, #011330 0%, #022356 100%)',
    glassEffect: {
      background: 'rgba(1, 19, 48, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
};
