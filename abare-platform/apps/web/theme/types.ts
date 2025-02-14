import { MantineThemeOverride } from '@mantine/core';

declare module '@mantine/core' {
  export interface MantineThemeOther {
    backgroundGradient: string;
    glassEffect: Record<string, any>;
    cardGlow: Record<string, any>;
  }
}

export interface CustomTheme extends MantineThemeOverride {
  other: {
    backgroundGradient: string;
    glassEffect: Record<string, any>;
    cardGlow: Record<string, any>;
  };
}
