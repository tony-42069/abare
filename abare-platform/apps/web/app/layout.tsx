import React from 'react';
import RootLayoutServer from './layout.server';
import RootLayoutClient from './layout.client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayoutServer>
      <RootLayoutClient>{children}</RootLayoutClient>
    </RootLayoutServer>
  );
}
