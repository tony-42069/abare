'use client';

import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
}
