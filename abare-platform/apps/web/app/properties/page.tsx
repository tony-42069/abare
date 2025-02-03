import { Container, Title, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function PropertiesPage() {
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Properties</Title>
        <Button leftSection={<IconPlus size={14} />}>Add Property</Button>
      </Group>
    </Container>
  );
}
