import { Container, Title, Group, SimpleGrid, Card, Text, RingProgress } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

export default function MarketPage() {
  const marketData = [
    {
      title: 'SOFR Rate',
      value: '5.33%',
      change: '+0.02',
      trend: 'up'
    },
    {
      title: '10Y Treasury',
      value: '4.15%',
      change: '-0.05',
      trend: 'down'
    },
    {
      title: 'Cap Rate (Office)',
      value: '6.8%',
      change: '+0.3',
      trend: 'up'
    },
    {
      title: 'Cap Rate (Retail)',
      value: '6.2%',
      change: '-0.1',
      trend: 'down'
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Market Data</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        {marketData.map((metric) => (
          <Card key={metric.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {metric.title}
                </Text>
                <Text size="xl" fw={700}>
                  {metric.value}
                </Text>
              </div>
              <Group gap={4} mt={4}>
                {metric.trend === 'up' ? (
                  <IconArrowUpRight size={20} style={{ color: '#40c057' }} />
                ) : (
                  <IconArrowDownRight size={20} style={{ color: '#fa5252' }} />
                )}
                <Text size="sm" c={metric.trend === 'up' ? 'teal' : 'red'}>
                  {metric.change}%
                </Text>
              </Group>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">Historical Trends</Title>
          <Text c="dimmed">Chart component will be added here</Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">Market Analysis</Title>
          <Text c="dimmed">Analysis component will be added here</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
