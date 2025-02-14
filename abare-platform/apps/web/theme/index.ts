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
  '#011330',
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

const neonCyan: MantineColorsTuple = [
  '#E6FFFB',
  '#B5F5EC',
  '#87E8DE',
  '#5CDBD3',
  '#36CFC9',
  '#13C2C2',
  '#08979C',
  '#006D75',
  '#00474F',
  '#002329',
];

export const theme: CustomTheme = {
  primaryColor: 'neonBlue',
  colors: {
    darkBlue,
    neonBlue,
    neonPurple,
    neonCyan,
  },
  fontFamily: 'Inter, sans-serif',
  primaryShade: { light: 6, dark: 5 },
  white: '#FFFFFF',
  black: '#011330',
  defaultRadius: 'md',
  components: {
    Card: {
      defaultProps: {
        bg: 'transparent',
        style: {
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },
    Paper: {
      defaultProps: {
        bg: 'transparent',
        style: {
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },
    Button: {
      defaultProps: {
        variant: 'gradient',
        gradient: { from: 'neonBlue.6', to: 'neonPurple.6', deg: 45 },
        style: {
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          },
        },
      },
    },
    Title: {
      defaultProps: {
        c: 'white',
        style: {
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
      },
    },
    Text: {
      defaultProps: {
        c: 'gray.3',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'gradient',
        gradient: { from: 'neonBlue.6', to: 'neonCyan.6', deg: 45 },
      },
    },
  },
  other: {
    backgroundGradient: 'radial-gradient(circle at top right, #022356 0%, #011330 100%)',
    glassEffect: {
      background: 'rgba(1, 19, 48, 0.5)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(1, 19, 48, 0.6)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      },
    },
    cardGlow: {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        padding: '2px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      },
    },
  },
};
