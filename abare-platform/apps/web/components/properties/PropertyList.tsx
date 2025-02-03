import { useState, useMemo } from 'react';
import { SimpleGrid, TextInput, Select, Group, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Property, PropertyType, RiskProfile } from '@abare/core';
import { PropertyCard } from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

type SortOption = 'name' | 'occupancy' | 'squareFeet';

export function PropertyList({ properties, onPropertyClick }: PropertyListProps) {
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [riskProfile, setRiskProfile] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const filteredProperties = useMemo(() => {
    return properties
      .filter(property => {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          property.name.toLowerCase().includes(searchLower) ||
          property.address.street.toLowerCase().includes(searchLower) ||
          property.address.city.toLowerCase().includes(searchLower);
        
        const matchesType = propertyType === 'all' || property.type === propertyType;
        const matchesRisk = riskProfile === 'all' || property.riskProfile === riskProfile;
        
        return matchesSearch && matchesType && matchesRisk;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'occupancy':
            return b.occupancyRate - a.occupancyRate;
          case 'squareFeet':
            return b.squareFeet - a.squareFeet;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [properties, search, propertyType, riskProfile, sortBy]);

  return (
    <Stack gap="md">
      <Group grow>
        <TextInput
          placeholder="Search properties..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
        />
        <Select
          value={propertyType}
          onChange={(value) => setPropertyType(value || 'all')}
          placeholder="Property Type"
          data={[
            { value: 'all', label: 'All Types' },
            ...Object.values(PropertyType).map(type => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1)
            }))
          ]}
        />
        <Select
          value={riskProfile}
          onChange={(value) => setRiskProfile(value || 'all')}
          placeholder="Risk Profile"
          data={[
            { value: 'all', label: 'All Profiles' },
            ...Object.values(RiskProfile).map(profile => ({
              value: profile,
              label: profile.charAt(0).toUpperCase() + profile.slice(1)
            }))
          ]}
        />
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          placeholder="Sort By"
          data={[
            { value: 'name', label: 'Name' },
            { value: 'occupancy', label: 'Occupancy' },
            { value: 'squareFeet', label: 'Square Feet' }
          ]}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => onPropertyClick?.(property)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
