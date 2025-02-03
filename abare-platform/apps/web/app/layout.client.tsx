"use client";

import '@mantine/core/styles.css';
import { MantineProvider, AppShell, Burger, Group, Title } from '@mantine/core';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';

const HEADER_HEIGHT = 60;

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <MantineProvider>
          <AppShell
            header={{ height: HEADER_HEIGHT }}
            navbar={{
              width: 300,
              breakpoint: 'sm',
              collapsed: { mobile: !opened }
            }}
            padding="md"
          >
            <AppShell.Header>
              <Group h="100%" px="md">
                <Burger
                  opened={opened}
                  onClick={() => setOpened(!opened)}
                  size="sm"
                />
                <Title order={1} size="h3">ABARE Platform</Title>
              </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
              <Navigation />
            </AppShell.Navbar>

            <AppShell.Main>
              {children}
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
