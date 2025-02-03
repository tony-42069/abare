import { Container, Title, Button, Group, SimpleGrid, Card, Text } from '@mantine/core';
import { IconPlus, IconBuildingSkyscraper, IconFileAnalytics, IconChartDots } from '@tabler/icons-react';

export default function AnalysisPage() {
  const analysisTypes = [
    {
      title: 'Property Analysis',
      description: 'Analyze property performance, risks, and market position',
      icon: IconBuildingSkyscraper
    },
    {
      title: 'Document Analysis',
      description: 'Extract and analyze information from property documents',
      icon: IconFileAnalytics
    },
    {
      title: 'Market Analysis',
      description: 'Analyze market trends and comparative metrics',
      icon: IconChartDots
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Analysis</Title>
        <Button leftSection={<IconPlus size={14} />}>New Analysis</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {analysisTypes.map((type) => (
          <Card 
            key={type.title} 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer' }}
          >
            <type.icon size={32} style={{ marginBottom: 16 }} />
            <Text fw={500} size="lg" mb="xs">{type.title}</Text>
            <Text size="sm" c="dimmed">{type.description}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Title order={2} size="h3" mb="md">Recent Analyses</Title>
        <Text c="dimmed">No analyses created yet</Text>
      </Card>
    </Container>
  );
}
