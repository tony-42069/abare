import { Container, Title, Button, Group, Card, Text } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

export default function DocumentsPage() {
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Documents</Title>
        <Button leftSection={<IconUpload size={14} />}>Upload Documents</Button>
      </Group>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Group justify="center" py="xl">
          <div style={{ textAlign: 'center' }}>
            <IconUpload size={48} style={{ opacity: 0.5 }} />
            <Text size="xl" fw={500} mt="md">
              Drop files here or click to upload
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX
            </Text>
          </div>
        </Group>
      </Card>
    </Container>
  );
}
