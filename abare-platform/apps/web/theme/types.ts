import { MantineThemeOverride } from '@mantine/core';

declare module '@mantine/core' {
  export interface MantineThemeOther {
    backgroundGradient: string;
    glassEffect: {
      background: string;
      backdropFilter: string;
      border: string;
    };
  }
}

export interface CustomTheme extends MantineThemeOverride {
  other: {
    backgroundGradient: string;
    glassEffect: {
      background: string;
      backdropFilter: string;
      border: string;
    };
  };
}
