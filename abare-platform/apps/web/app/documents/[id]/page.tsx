'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Group, Loader, Text, Stack } from '@mantine/core';
import { DocumentPreview } from '@/components/documents/DocumentPreview';

interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
}

export default function DocumentViewPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch document');

        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading document...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !document) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Text c="red" size="lg">
            {error || 'Document not found'}
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>{document.filename}</Title>
      </Group>

      <DocumentPreview
        documentId={document.id}
        filename={document.filename}
        fileType={document.file_type}
      />
    </Container>
  );
}
