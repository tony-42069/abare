"use client";

import { NavLink, Stack } from '@mantine/core';
import { IconHome, IconFiles, IconChartBar, IconChartLine } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { icon: IconHome, label: 'Properties', href: '/properties' },
    { icon: IconFiles, label: 'Documents', href: '/documents' },
    { icon: IconChartBar, label: 'Analysis', href: '/analysis' },
    { icon: IconChartLine, label: 'Market Data', href: '/market' },
  ];

  const items = links.map((link) => (
    <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
      <NavLink
        active={pathname === link.href}
        label={link.label}
        leftSection={<link.icon size="1rem" stroke={1.5} />}
      />
    </Link>
  ));

  return (
    <Stack gap={0}>
      {items}
    </Stack>
  );
}
