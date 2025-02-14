'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Grid, 
  Card, 
  Text, 
  Stack, 
  Badge,
  Progress,
  Transition,
  Box,
  ActionIcon,
  Tooltip,
  rem,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconBuilding, 
  IconCalendar, 
  IconParking, 
  IconUsers, 
  IconPlus,
  IconChartBar,
  IconMap,
  IconBuildingCommunity,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { theme } from '../../theme';
import { Property, PropertyType, RiskLevel, RiskProfileType } from '@abare/core';
import { PropertyList } from '../../components/properties/PropertyList';
import { AddPropertyModal } from '../../components/properties/AddPropertyModal';

// TODO: Replace with API call
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Tech Center Office Park',
    property_type: PropertyType.Office,
    address: '123 Innovation Drive, Austin, TX 78701',
    square_footage: 150000,
    year_built: 2015,
    occupancy_rate: 95,
    status: 'active',
    metadata: {
      tenants: ['TechCorp', 'InnovateSoft', 'DataCo'],
      amenities: ['Gym', 'Cafeteria', 'Conference Center'],
      parking_spaces: 500,
      market_id: 'austin-tx',
      risk_profile: {
        type: RiskProfileType.Core,
        level: RiskLevel.Low,
        score: 85,
        factors: [],
        lastUpdated: new Date().toISOString()
      }
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Downtown Retail Plaza',
    property_type: PropertyType.Retail,
    address: '456 Main Street, Austin, TX 78702',
    square_footage: 75000,
    year_built: 2000,
    occupancy_rate: 85,
    status: 'active',
    metadata: {
      tenants: ['RetailCo', 'FoodCourt LLC', 'ShopMart'],
      amenities: ['Food Court', 'Parking Garage'],
      parking_spaces: 300,
      market_id: 'austin-tx',
      risk_profile: {
        type: RiskProfileType.ValueAdd,
        level: RiskLevel.Moderate,
        score: 65,
        factors: [],
        lastUpdated: new Date().toISOString()
      }
    },
    created_at: '2024-01-02',
    updated_at: '2024-01-02'
  }
];

interface GradientConfig {
  from: string;
  to: string;
}

const typeGradients: Record<PropertyType, GradientConfig> = {
  [PropertyType.Office]: { from: 'blue', to: 'cyan' },
  [PropertyType.Retail]: { from: 'teal', to: 'lime' },
  [PropertyType.Industrial]: { from: 'orange', to: 'yellow' },
  [PropertyType.Multifamily]: { from: 'violet', to: 'grape' },
  [PropertyType.MixedUse]: { from: 'indigo', to: 'blue' },
  [PropertyType.Other]: { from: 'gray', to: 'gray' },
};

const riskGradients: Record<RiskProfileType, GradientConfig> = {
  [RiskProfileType.Core]: { from: 'blue', to: 'cyan' },
  [RiskProfileType.ValueAdd]: { from: 'yellow', to: 'orange' },
  [RiskProfileType.Opportunistic]: { from: 'orange', to: 'red' },
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleAddProperty = (newProperty: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    const property: Property = {
      ...newProperty,
      id: Math.random().toString(36).substr(2, 9), // TODO: Replace with proper ID generation
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProperties([...properties, property]);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleBackToList = () => {
    setSelectedProperty(null);
  };

  return (
    <Container size="xl" py="xl" style={{ minHeight: '100vh' }}>
      {selectedProperty ? (
        <Stack gap="xl">
          <Card withBorder padding="lg" radius="md">
            <Stack gap="lg">
              <Group>
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={14} />}
                  onClick={handleBackToList}
                >
                  Back to Properties
                </Button>
              </Group>

              <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                  <Title 
                    order={1}
                    style={{ 
                      background: 'linear-gradient(45deg, #fff, #a7b5ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {selectedProperty.name}
                  </Title>
                  <Group align="center" gap="xs">
                    <IconMap size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                    <Text size="lg" c="dimmed">
                      {selectedProperty.address}
                    </Text>
                  </Group>
                </Stack>
                <Group>
                  <Badge 
                    variant="gradient" 
                    gradient={typeGradients[selectedProperty.property_type]} 
                    size="lg"
                  >
                    {selectedProperty.property_type}
                  </Badge>
                  <Badge 
                    variant="gradient" 
                    gradient={riskGradients[selectedProperty.metadata.risk_profile.type]} 
                    size="lg"
                  >
                    {selectedProperty.metadata.risk_profile.type}
                  </Badge>
                </Group>
              </Group>

              <Group>
                <Tooltip label="Edit Property">
                  <ActionIcon variant="subtle" color="blue" size="lg">
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete Property">
                  <ActionIcon variant="subtle" color="red" size="lg">
                    <IconTrash size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding="lg" radius="md">
                <Stack gap="lg">
                  <Group>
                    <IconBuildingCommunity 
                      size={24} 
                      style={{ color: 'var(--mantine-color-blue-6)' }}
                    />
                    <Title order={3}>Property Details</Title>
                  </Group>
                  
                  <Grid>
                    <Grid.Col span={6}>
                      <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconBuilding size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            <Text size="sm" c="dimmed">Square Feet</Text>
                          </Group>
                          <Text fw={500}>{selectedProperty.square_footage.toLocaleString()}</Text>
                        </Stack>
                      </Card>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconCalendar size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            <Text size="sm" c="dimmed">Year Built</Text>
                          </Group>
                          <Text fw={500}>{selectedProperty.year_built}</Text>
                        </Stack>
                      </Card>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconParking size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            <Text size="sm" c="dimmed">Parking Spaces</Text>
                          </Group>
                          <Text fw={500}>{selectedProperty.metadata.parking_spaces}</Text>
                        </Stack>
                      </Card>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconUsers size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            <Text size="sm" c="dimmed">Occupancy Rate</Text>
                          </Group>
                          <Group justify="space-between" align="center">
                            <Text fw={500}>{selectedProperty.occupancy_rate}%</Text>
                            {typeof selectedProperty.occupancy_rate === 'number' && (
                              <Progress 
                                value={selectedProperty.occupancy_rate} 
                                size="sm" 
                                radius="xl"
                                style={{ width: '60px' }}
                              />
                            )}
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  </Grid>

                  {selectedProperty.metadata.amenities && selectedProperty.metadata.amenities.length > 0 && (
                    <Stack gap="xs">
                      <Text fw={500}>Amenities</Text>
                      <Group gap="xs">
                        {selectedProperty.metadata.amenities.map((amenity) => (
                          <Badge 
                            key={amenity} 
                            variant="gradient" 
                            gradient={{ from: 'blue.3', to: 'blue.5' }}
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding="lg" radius="md">
                <Stack gap="lg">
                  <Group>
                    <IconUsers 
                      size={24} 
                      style={{ color: 'var(--mantine-color-blue-6)' }}
                    />
                    <Title order={3}>Tenant Information</Title>
                  </Group>
                  
                  {selectedProperty.metadata.tenants && selectedProperty.metadata.tenants.length > 0 ? (
                    <Stack gap="md">
                      {selectedProperty.metadata.tenants.map((tenant) => (
                        <Card 
                          key={tenant} 
                          withBorder 
                          padding="md" 
                          radius="md"
                          style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.05)',
                              transform: 'translateX(5px)',
                            }
                          }}
                        >
                          <Group justify="space-between">
                            <Text fw={500}>{tenant}</Text>
                            <IconChevronRight size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Text c="dimmed">No tenants listed</Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      ) : (
        <Stack gap="xl">
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between">
              <Group>
                <IconBuildingCommunity 
                  size={24} 
                  style={{ color: 'var(--mantine-color-blue-6)' }}
                />
                <Title 
                  order={1}
                  style={{ 
                    background: 'linear-gradient(45deg, #fff, #a7b5ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Properties
                </Title>
              </Group>
              <Button 
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<IconPlus size={14} />}
                onClick={() => setAddModalOpened(true)}
                size="md"
              >
                Add Property
              </Button>
            </Group>
          </Card>

          <Transition
            mounted={true}
            transition="fade"
            duration={200}
          >
            {(styles) => (
              <div style={styles}>
                <PropertyList 
                  properties={properties}
                  onPropertyClick={handlePropertyClick}
                />
              </div>
            )}
          </Transition>
        </Stack>
      )}

      <AddPropertyModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        onSubmit={handleAddProperty}
      />
    </Container>
  );
}
