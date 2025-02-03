import { Container, Title, SimpleGrid, Card, Text, Group } from '@mantine/core';
import { IconBuilding, IconFiles, IconChartBar, IconChartLine } from '@tabler/icons-react';

export default function HomePage() {
  const stats = [
    { 
      title: 'Properties',
      value: '15',
      icon: IconBuilding,
      href: '/properties'
    },
    { 
      title: 'Documents',
      value: '156',
      icon: IconFiles,
      href: '/documents'
    },
    { 
      title: 'Analyses',
      value: '42',
      icon: IconChartBar,
      href: '/analysis'
    },
    { 
      title: 'Market Data',
      value: 'Live',
      icon: IconChartLine,
      href: '/market'
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Dashboard</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {stats.map((stat) => (
          <Card 
            key={stat.title}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            component="a"
            href={stat.href}
            style={{ textDecoration: 'none' }}
          >
            <Group>
              <stat.icon size={24} />
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <Text size="xl" fw={700}>
                  {stat.value}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">Recent Properties</Title>
          <Text c="dimmed">No properties added yet</Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">Recent Documents</Title>
          <Text c="dimmed">No documents uploaded yet</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
