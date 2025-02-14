import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';
import { Inter } from 'next/font/google';
import { Navigation } from '../components/Navigation';
import { ColorSchemeProvider } from '../components/ColorSchemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ABARE Platform',
  description: 'Advanced Business Analytics & Real Estate Platform',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
            body {
              margin: 0;
              min-height: 100vh;
              background: ${theme.other.backgroundGradient};
              color: ${theme.white};
            }

            /* Hide scrollbar for Chrome, Safari and Opera */
            ::-webkit-scrollbar {
              display: none;
            }

            /* Hide scrollbar for IE, Edge and Firefox */
            * {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          `}
        </style>
      </head>
      <body className={inter.className}>
        <ColorSchemeProvider>
          <Navigation>{children}</Navigation>
        </ColorSchemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
