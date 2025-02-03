'use client';

import { Container, Title, Group } from '@mantine/core';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';

export default function DocumentsPage() {
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Documents</Title>
      </Group>

      <DocumentUpload />
      <DocumentList />
    </Container>
  );
}
