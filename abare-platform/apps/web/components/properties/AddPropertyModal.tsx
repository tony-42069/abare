import { useState } from 'react';
import { 
  Modal, 
  TextInput, 
  NumberInput, 
  Select, 
  Button, 
  Stack,
  Grid,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  Card,
  Progress,
} from '@mantine/core';
import { 
  IconBuilding,
  IconMapPin,
  IconCalendar,
  IconParking,
  IconUsers,
  IconChartPie,
} from '@tabler/icons-react';
import { Property, PropertyType, RiskProfileType, RiskLevel } from '@abare/core';

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

interface AddPropertyModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function AddPropertyModal({ opened, onClose, onSubmit }: AddPropertyModalProps) {
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.Office);
  const [address, setAddress] = useState('');
  const [squareFootage, setSquareFootage] = useState<number>(0);
  const [yearBuilt, setYearBuilt] = useState<number | undefined>();
  const [occupancyRate, setOccupancyRate] = useState<number>(100);
  const [parkingSpaces, setParkingSpaces] = useState<number | undefined>();
  const [riskProfileType, setRiskProfileType] = useState<RiskProfileType>(RiskProfileType.Core);

  const handleSubmit = () => {
    onSubmit({
      name,
      property_type: propertyType,
      address,
      square_footage: squareFootage,
      year_built: yearBuilt,
      occupancy_rate: occupancyRate,
      status: 'active',
      metadata: {
        tenants: [],
        amenities: [],
        parking_spaces: parkingSpaces || 0,
        market_id: 'default', // This should be selected from available markets
        risk_profile: {
          type: riskProfileType,
          level: RiskLevel.Low,
          score: 0,
          factors: [],
          lastUpdated: new Date().toISOString()
        }
      }
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPropertyType(PropertyType.Office);
    setAddress('');
    setSquareFootage(0);
    setYearBuilt(undefined);
    setOccupancyRate(100);
    setParkingSpaces(undefined);
    setRiskProfileType(RiskProfileType.Core);
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      size="xl"
      padding="lg"
      radius="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      title={
        <Group>
          <IconBuilding size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
          <Title 
            order={2}
            style={{ 
              background: 'linear-gradient(45deg, #fff, #a7b5ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Add New Property
          </Title>
        </Group>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Stack gap="lg">
          <Card withBorder padding="md" radius="md">
            <Stack gap="md">
              <Group>
                <IconBuilding size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
                <Text fw={500}>Basic Information</Text>
              </Group>

              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Property Name"
                    placeholder="Enter property name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    size="md"
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <Select
                    label="Property Type"
                    value={propertyType}
                    onChange={(value) => setPropertyType(value as PropertyType)}
                    data={Object.values(PropertyType).map(type => ({
                      value: type,
                      label: type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' '),
                      rightSection: (
                        <Badge 
                          variant="gradient" 
                          gradient={typeGradients[type as PropertyType]}
                          size="sm"
                        >
                          {type}
                        </Badge>
                      )
                    }))}
                    required
                    size="md"
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <Select
                    label="Risk Profile"
                    value={riskProfileType}
                    onChange={(value) => setRiskProfileType(value as RiskProfileType)}
                    data={Object.values(RiskProfileType).map(type => ({
                      value: type,
                      label: type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' '),
                      rightSection: (
                        <Badge 
                          variant="gradient" 
                          gradient={riskGradients[type as RiskProfileType]}
                          size="sm"
                        >
                          {type}
                        </Badge>
                      )
                    }))}
                    required
                    size="md"
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Stack gap="md">
              <Group>
                <IconMapPin size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
                <Text fw={500}>Location & Size</Text>
              </Group>

              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Address"
                    placeholder="Enter full address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    size="md"
                    leftSection={<IconMapPin size={16} />}
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <NumberInput
                    label="Square Footage"
                    placeholder="Enter total square footage"
                    value={squareFootage}
                    onChange={(value) => setSquareFootage(typeof value === 'number' ? value : 0)}
                    min={0}
                    required
                    size="md"
                    leftSection={<IconBuilding size={16} />}
                    thousandSeparator=","
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <NumberInput
                    label="Year Built"
                    placeholder="Enter year built"
                    value={yearBuilt}
                    onChange={(value) => setYearBuilt(typeof value === 'number' ? value : undefined)}
                    min={1800}
                    max={new Date().getFullYear()}
                    size="md"
                    leftSection={<IconCalendar size={16} />}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Stack gap="md">
              <Group>
                <IconChartPie size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
                <Text fw={500}>Property Details</Text>
              </Group>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Occupancy Rate (%)"
                    placeholder="Enter occupancy rate"
                    value={occupancyRate}
                    onChange={(value) => setOccupancyRate(typeof value === 'number' ? value : 0)}
                    min={0}
                    max={100}
                    required
                    size="md"
                    leftSection={<IconUsers size={16} />}
                    rightSection={
                      <Progress 
                        value={occupancyRate} 
                        size="sm" 
                        radius="xl"
                        style={{ width: '60px' }}
                      />
                    }
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <NumberInput
                    label="Parking Spaces"
                    placeholder="Enter number of parking spaces"
                    value={parkingSpaces}
                    onChange={(value) => setParkingSpaces(typeof value === 'number' ? value : undefined)}
                    min={0}
                    size="md"
                    leftSection={<IconParking size={16} />}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button 
              variant="default" 
              onClick={onClose}
              size="md"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              size="md"
            >
              Add Property
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
