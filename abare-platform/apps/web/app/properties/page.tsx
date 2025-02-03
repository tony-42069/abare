'use client';

import { useState } from 'react';
import { Container, Title, Button, Group, Grid, Card, Text, Stack, Badge } from '@mantine/core';
import { IconArrowLeft, IconBuilding, IconCalendar, IconParking, IconUsers, IconPlus } from '@tabler/icons-react';
import { Property, PropertyType, RiskProfile } from '@abare/core';
import { PropertyList } from '../../components/properties/PropertyList';
import { AddPropertyModal } from '../../components/properties/AddPropertyModal';

// TODO: Replace with API call
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Tech Center Office Park',
    type: PropertyType.Office,
    address: {
      street: '123 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    },
    squareFeet: 150000,
    documents: [],
    riskProfile: RiskProfile.Core,
    yearBuilt: 2015,
    occupancyRate: 95,
    tenants: ['TechCorp', 'InnovateSoft', 'DataCo'],
    amenities: ['Gym', 'Cafeteria', 'Conference Center'],
    parkingSpaces: 500,
    marketId: 'austin-tx',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Downtown Retail Plaza',
    type: PropertyType.Retail,
    address: {
      street: '456 Main Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      country: 'USA'
    },
    squareFeet: 75000,
    documents: [],
    riskProfile: RiskProfile.ValueAdd,
    yearBuilt: 2000,
    occupancyRate: 85,
    tenants: ['RetailCo', 'FoodCourt LLC', 'ShopMart'],
    amenities: ['Food Court', 'Parking Garage'],
    parkingSpaces: 300,
    marketId: 'austin-tx',
    status: 'active',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

const typeColors: Record<PropertyType, string> = {
  [PropertyType.Office]: 'blue',
  [PropertyType.Retail]: 'green',
  [PropertyType.Industrial]: 'orange',
  [PropertyType.Multifamily]: 'violet',
  [PropertyType.Mixed]: 'grape',
  [PropertyType.Other]: 'gray',
};

const riskColors: Record<RiskProfile, string> = {
  [RiskProfile.Core]: 'blue',
  [RiskProfile.ValueAdd]: 'yellow',
  [RiskProfile.Opportunistic]: 'orange',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleAddProperty = (newProperty: Omit<Property, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    const property: Property = {
      ...newProperty,
      id: Math.random().toString(36).substr(2, 9), // TODO: Replace with proper ID generation
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
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
    <Container size="xl" py="xl">
      {selectedProperty ? (
        <Stack gap="xl">
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
              <Title order={1}>{selectedProperty.name}</Title>
              <Text size="lg" c="dimmed">
                {selectedProperty.address.street}, {selectedProperty.address.city}, {selectedProperty.address.state} {selectedProperty.address.zipCode}
              </Text>
            </Stack>
            <Group>
              <Badge color={typeColors[selectedProperty.type]} size="lg">
                {selectedProperty.type}
              </Badge>
              <Badge color={riskColors[selectedProperty.riskProfile]} size="lg">
                {selectedProperty.riskProfile}
              </Badge>
            </Group>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Title order={3}>Property Details</Title>
                  
                  <Group gap="xl">
                    <Group gap="xs">
                      <IconBuilding size={20} />
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Square Feet</Text>
                        <Text>{selectedProperty.squareFeet.toLocaleString()}</Text>
                      </Stack>
                    </Group>

                    <Group gap="xs">
                      <IconCalendar size={20} />
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Year Built</Text>
                        <Text>{selectedProperty.yearBuilt}</Text>
                      </Stack>
                    </Group>

                    <Group gap="xs">
                      <IconParking size={20} />
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Parking Spaces</Text>
                        <Text>{selectedProperty.parkingSpaces}</Text>
                      </Stack>
                    </Group>
                  </Group>

                  <Group gap="xs">
                    <IconUsers size={20} />
                    <Stack gap={0}>
                      <Text size="sm" c="dimmed">Occupancy Rate</Text>
                      <Text>{selectedProperty.occupancyRate}%</Text>
                    </Stack>
                  </Group>

                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                    <Stack gap="xs">
                      <Text fw={500}>Amenities</Text>
                      <Group gap="xs">
                        {selectedProperty.amenities.map((amenity) => (
                          <Badge key={amenity} variant="light">
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
              <Card withBorder>
                <Stack gap="md">
                  <Title order={3}>Tenant Information</Title>
                  
                  {selectedProperty.tenants && selectedProperty.tenants.length > 0 ? (
                    <Stack gap="xs">
                      {selectedProperty.tenants.map((tenant) => (
                        <Card key={tenant} withBorder>
                          <Text>{tenant}</Text>
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
        <Stack>
          <Group justify="space-between" mb="xl">
            <Title order={1}>Properties</Title>
            <Button 
              leftSection={<IconPlus size={14} />}
              onClick={() => setAddModalOpened(true)}
            >
              Add Property
            </Button>
          </Group>

          <PropertyList 
            properties={properties}
            onPropertyClick={handlePropertyClick}
          />
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
