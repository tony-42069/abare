import { Card, Text, Group, Badge, Stack } from '@mantine/core';
import { Property, PropertyType, RiskProfile } from '@abare/core';

const typeColors = {
  [PropertyType.Office]: 'blue',
  [PropertyType.Retail]: 'green',
  [PropertyType.Industrial]: 'orange',
  [PropertyType.Multifamily]: 'violet',
  [PropertyType.Mixed]: 'grape',
  [PropertyType.Other]: 'gray',
};

const riskColors = {
  [RiskProfile.Core]: 'blue',
  [RiskProfile.ValueAdd]: 'yellow',
  [RiskProfile.Opportunistic]: 'orange',
};

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text size="lg" fw={500}>{property.name}</Text>
          <Badge color={typeColors[property.type]}>{property.type}</Badge>
        </Group>

        <Text size="sm" c="dimmed">
          {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
        </Text>

        <Group gap="xs">
          <Badge color={riskColors[property.riskProfile]} variant="light">
            {property.riskProfile}
          </Badge>
          <Badge variant="outline">
            {property.squareFeet.toLocaleString()} SF
          </Badge>
          <Badge variant="outline" color={property.occupancyRate >= 90 ? 'green' : property.occupancyRate >= 75 ? 'yellow' : 'red'}>
            {property.occupancyRate}% Occupied
          </Badge>
        </Group>

        {property.tenants && property.tenants.length > 0 && (
          <Text size="sm" c="dimmed">
            {property.tenants.length} Tenants
          </Text>
        )}
      </Stack>
    </Card>
  );
}
