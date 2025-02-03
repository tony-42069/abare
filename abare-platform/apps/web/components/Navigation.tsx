'use client';

import { useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  rem,
  Box,
} from '@mantine/core';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconHome,
  IconFileText,
  IconChartBar,
  IconChartLine,
} from '@tabler/icons-react';
import { theme } from '../theme';

const links = [
  { label: 'Properties', href: '/properties', icon: IconHome },
  { label: 'Documents', href: '/documents', icon: IconFileText },
  { label: 'Analysis', href: '/analysis', icon: IconChartBar },
  { label: 'Market Data', href: '/market', icon: IconChartLine },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          ...theme.other.glassEffect,
          borderBottom: 'none',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
              color={theme.white}
            />
            <Title order={3} c="white">ABARE Platform</Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          ...theme.other.glassEffect,
          borderRight: 'none',
        }}
      >
        <Box>
          {links.map((link) => (
            <NavLink
              key={link.href}
              component={Link}
              href={link.href}
              label={link.label}
              leftSection={<link.icon style={{ width: rem(20), height: rem(20) }} />}
              active={pathname === link.href}
              variant={pathname === link.href ? 'filled' : 'subtle'}
              style={theme => ({
                borderRadius: theme.radius.md,
                color: theme.white,
                marginBottom: rem(4),
                '&[data-active]': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme.white,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              })}
            />
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          background: 'transparent',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
