import { Card, Text, Group, Badge, Stack, Box, Progress, ActionIcon, Tooltip } from '@mantine/core';
import { Property, PropertyType, RiskProfileType } from '@abare/core';
import { IconBuilding, IconMapPin, IconChartBar, IconUsers } from '@tabler/icons-react';
import { theme } from '../../theme';

const typeGradients = {
  [PropertyType.Office]: { from: 'blue', to: 'cyan' },
  [PropertyType.Retail]: { from: 'teal', to: 'lime' },
  [PropertyType.Industrial]: { from: 'orange', to: 'yellow' },
  [PropertyType.Multifamily]: { from: 'violet', to: 'grape' },
  [PropertyType.MixedUse]: { from: 'indigo', to: 'blue' },
  [PropertyType.Other]: { from: 'gray', to: 'gray' },
};

const riskGradients = {
  [RiskProfileType.Core]: { from: 'blue', to: 'cyan' },
  [RiskProfileType.ValueAdd]: { from: 'yellow', to: 'orange' },
  [RiskProfileType.Opportunistic]: { from: 'orange', to: 'red' },
};

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const getOccupancyColor = (rate: number | undefined) => {
    if (!rate) return 'gray';
    return rate >= 90 
      ? 'green' 
      : rate >= 75 
        ? 'yellow' 
        : 'red';
  };

  const occupancyColor = getOccupancyColor(property.occupancy_rate);

  return (
    <Card 
      withBorder 
      padding="lg" 
      radius="md"
      onClick={() => onClick?.(property)}
      style={(theme) => ({
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        ...theme.other.glassEffect,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      })}
    >
      <Box {...theme.other.cardGlow}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Group>
              <IconBuilding size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text size="xl" fw={600} 
                style={{ 
                  background: 'linear-gradient(45deg, #fff, #a7b5ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {property.name}
              </Text>
            </Group>
            <Group gap="xs">
              <Badge 
                variant="gradient" 
                gradient={typeGradients[property.property_type]}
                size="lg"
              >
                {property.property_type}
              </Badge>
              <Badge 
                variant="gradient" 
                gradient={riskGradients[property.metadata.risk_profile.type]}
                size="lg"
              >
                {property.metadata.risk_profile.type}
              </Badge>
            </Group>
          </Group>

          <Group align="center" gap="xs">
            <IconMapPin size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="sm" c="dimmed">{property.address}</Text>
          </Group>

          <Group grow>
            <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Square Feet</Text>
                <Text fw={500}>{property.square_footage.toLocaleString()}</Text>
              </Stack>
            </Card>

            {property.year_built && (
              <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Year Built</Text>
                  <Text fw={500}>{property.year_built}</Text>
                </Stack>
              </Card>
            )}

            <Card padding="sm" radius="md" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Occupancy</Text>
                  <Text fw={500}>{property.occupancy_rate ?? 'N/A'}%</Text>
                </Group>
                {property.occupancy_rate !== undefined && (
                  <Progress 
                    value={property.occupancy_rate} 
                    color={occupancyColor}
                    size="sm"
                    radius="xl"
                  />
                )}
              </Stack>
            </Card>
          </Group>

          {property.metadata.tenants && property.metadata.tenants.length > 0 && (
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUsers size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  <Text size="sm" fw={500}>Tenants</Text>
                </Group>
                <Tooltip label="Total Tenants">
                  <Badge 
                    variant="dot" 
                    size="sm"
                  >
                    {property.metadata.tenants.length}
                  </Badge>
                </Tooltip>
              </Group>
              <Group gap="xs">
                {property.metadata.tenants.map((tenant: string) => (
                  <Badge 
                    key={tenant} 
                    variant="gradient" 
                    gradient={{ from: 'blue.3', to: 'blue.5' }}
                    size="sm"
                  >
                    {tenant}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
