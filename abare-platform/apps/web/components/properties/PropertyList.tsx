import { useState, useMemo } from 'react';
import { 
  SimpleGrid, 
  TextInput, 
  Select, 
  Group, 
  Stack, 
  Title, 
  Text,
  Card,
  ActionIcon,
  Tooltip,
  Badge,
  Box,
  Transition,
  rem,
} from '@mantine/core';
import { 
  IconSearch, 
  IconAdjustments, 
  IconBuildingSkyscraper,
  IconChartPie,
  IconX,
} from '@tabler/icons-react';
import { Property, PropertyType, RiskProfileType } from '@abare/core';
import { PropertyCard } from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

interface FilterStats {
  total: number;
  byType: Record<string, number>;
  byRisk: Record<string, number>;
}

export function PropertyList({ properties, onPropertyClick }: PropertyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { filteredProperties, stats } = useMemo(() => {
    const filtered = properties.filter(property => {
      const matchesSearch = !searchQuery || 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !typeFilter || property.property_type === typeFilter;
      const matchesRisk = !riskFilter || property.metadata.risk_profile.type === riskFilter;

      return matchesSearch && matchesType && matchesRisk;
    });

    // Calculate statistics
    const stats: FilterStats = {
      total: filtered.length,
      byType: {},
      byRisk: {},
    };

    filtered.forEach(property => {
      // Count by type
      stats.byType[property.property_type] = (stats.byType[property.property_type] || 0) + 1;
      // Count by risk profile
      stats.byRisk[property.metadata.risk_profile.type] = 
        (stats.byRisk[property.metadata.risk_profile.type] || 0) + 1;
    });

    return { filteredProperties: filtered, stats };
  }, [properties, searchQuery, typeFilter, riskFilter]);

  const hasActiveFilters = searchQuery || typeFilter || riskFilter;

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setRiskFilter('');
  };

  return (
    <Stack gap="xl">
      <Card padding="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconBuildingSkyscraper 
                size={24} 
                style={{ color: 'var(--mantine-color-blue-6)' }}
              />
              <Title order={2}>Properties</Title>
              <Badge size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                {stats.total}
              </Badge>
            </Group>

            <Group>
              {hasActiveFilters && (
                <Tooltip label="Clear all filters">
                  <ActionIcon 
                    variant="subtle" 
                    onClick={clearFilters}
                    size="lg"
                  >
                    <IconX size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label={showFilters ? "Hide filters" : "Show filters"}>
                <ActionIcon 
                  variant="subtle" 
                  onClick={() => setShowFilters(!showFilters)}
                  size="lg"
                  color={showFilters ? 'blue' : undefined}
                >
                  <IconAdjustments size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <TextInput
            placeholder="Search properties by name or address..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
            size="md"
          />

          <Transition 
            mounted={showFilters} 
            transition="slide-down"
            duration={200}
          >
            {(styles) => (
              <Box style={styles}>
                <Group grow>
                  <Card padding="sm" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Property Type</Text>
                        {typeFilter && (
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => setTypeFilter('')}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                      <Select
                        placeholder="All Types"
                        value={typeFilter}
                        onChange={(value) => setTypeFilter(value || '')}
                        data={[
                          { value: '', label: 'All Types' },
                          ...Object.values(PropertyType).map(type => ({
                            value: type,
                            label: type.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' '),
                            rightSection: stats.byType[type] && (
                              <Badge size="sm" variant="light">
                                {stats.byType[type]}
                              </Badge>
                            )
                          }))
                        ]}
                      />
                    </Stack>
                  </Card>

                  <Card padding="sm" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Risk Profile</Text>
                        {riskFilter && (
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => setRiskFilter('')}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                      <Select
                        placeholder="All Risk Profiles"
                        value={riskFilter}
                        onChange={(value) => setRiskFilter(value || '')}
                        data={[
                          { value: '', label: 'All Risk Profiles' },
                          ...Object.values(RiskProfileType).map(type => ({
                            value: type,
                            label: type.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' '),
                            rightSection: stats.byRisk[type] && (
                              <Badge size="sm" variant="light">
                                {stats.byRisk[type]}
                              </Badge>
                            )
                          }))
                        ]}
                      />
                    </Stack>
                  </Card>
                </Group>
              </Box>
            )}
          </Transition>
        </Stack>
      </Card>

      {filteredProperties.length === 0 ? (
        <Card 
          padding="xl" 
          radius="md" 
          withBorder 
          style={{ 
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)'
          }}
        >
          <Stack align="center" gap="md">
            <IconBuildingSkyscraper 
              size={48} 
              style={{ color: 'var(--mantine-color-gray-5)' }}
            />
            <Title order={3}>No properties found</Title>
            <Text c="dimmed">
              Try adjusting your search or filters to find what you're looking for
            </Text>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid 
          cols={{ base: 1, sm: 2, lg: 3 }} 
          spacing="lg"
          verticalSpacing="lg"
        >
          {filteredProperties.map((property) => (
            <Transition
              key={property.id}
              mounted={true}
              transition="fade"
              duration={200}
            >
              {(styles) => (
                <div style={styles}>
                  <PropertyCard
                    property={property}
                    onClick={onPropertyClick}
                  />
                </div>
              )}
            </Transition>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
