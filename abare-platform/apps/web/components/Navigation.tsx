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
  Avatar,
  Menu,
  ActionIcon,
  Tooltip,
  Text,
  Divider,
  Badge,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconHome,
  IconFileText,
  IconChartBar,
  IconChartLine,
  IconBell,
  IconSettings,
  IconUser,
  IconLogout,
  IconChevronRight,
} from '@tabler/icons-react';
import { theme } from '../theme';

const links = [
  { 
    label: 'Properties', 
    href: '/properties', 
    icon: IconHome,
    badge: '15'
  },
  { 
    label: 'Documents', 
    href: '/documents', 
    icon: IconFileText,
    badge: '156'
  },
  { 
    label: 'Analysis', 
    href: '/analysis', 
    icon: IconChartBar,
    badge: '42'
  },
  { 
    label: 'Market Data', 
    href: '/market', 
    icon: IconChartLine,
    badge: 'Live'
  },
];

const getBreadcrumbs = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, index) => ({
    title: part.charAt(0).toUpperCase() + part.slice(1),
    href: '/' + parts.slice(0, index + 1).join('/')
  }));
};

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [opened, setOpened] = useState(false);
  const [notifications] = useState(3); // Example notification count
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      style={{
        background: theme.other.backgroundGradient,
      }}
    >
      <AppShell.Header
        style={{
          ...theme.other.glassEffect,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
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
            <Title order={3} c="white" 
              style={{ 
                background: 'linear-gradient(45deg, #fff, #a7b5ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ABARE Platform
            </Title>
          </Group>

          <Group>
            <Tooltip label="Notifications">
              <ActionIcon variant="subtle" color="gray" size="lg" pos="relative">
                <IconBell size={22} />
                {notifications > 0 && (
                  <Badge 
                    size="xs" 
                    variant="filled" 
                    color="red"
                    style={{ 
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      padding: '2px 4px',
                    }}
                  >
                    {notifications}
                  </Badge>
                )}
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <Avatar 
                    size="sm" 
                    color="blue" 
                    radius="xl"
                  />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown 
                style={{
                  ...theme.other.glassEffect,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<IconLogout size={14} />}
                  color="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {breadcrumbs.length > 0 && (
          <Box px="md" pb="xs">
            <Breadcrumbs
              separator={<IconChevronRight size={14} />}
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <Anchor component={Link} href="/" c="dimmed">
                Home
              </Anchor>
              {breadcrumbs.map((item, index) => (
                <Anchor
                  key={item.href}
                  component={Link}
                  href={item.href}
                  c={index === breadcrumbs.length - 1 ? 'white' : 'dimmed'}
                >
                  {item.title}
                </Anchor>
              ))}
            </Breadcrumbs>
          </Box>
        )}
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          ...theme.other.glassEffect,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Box>
          {links.map((link) => (
            <NavLink
              key={link.href}
              component={Link}
              href={link.href}
              label={
                <Group justify="space-between" wrap="nowrap">
                  <Text>{link.label}</Text>
                  <Badge 
                    variant="gradient" 
                    gradient={{ from: 'blue', to: 'cyan' }}
                    size="sm"
                  >
                    {link.badge}
                  </Badge>
                </Group>
              }
              leftSection={
                <link.icon 
                  style={{ 
                    width: rem(20), 
                    height: rem(20),
                  }} 
                />
              }
              active={pathname === link.href}
              variant={pathname === link.href ? 'filled' : 'subtle'}
              style={theme => ({
                borderRadius: theme.radius.md,
                color: theme.white,
                marginBottom: rem(4),
                transition: 'all 0.2s ease',
                '&[data-active]': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  color: theme.white,
                  transform: 'translateX(5px)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07))',
                  },
                },
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                  transform: 'translateX(5px)',
                },
              })}
            />
          ))}
        </Box>

        <Divider 
          my="xl" 
          color="rgba(255, 255, 255, 0.1)" 
          label={
            <Text size="xs" c="dimmed">Quick Actions</Text>
          }
          labelPosition="center"
        />

        <Box>
          <Text size="sm" c="dimmed" mb="md" ta="center">
            System Status: <Badge color="green" size="sm">Online</Badge>
          </Text>
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
