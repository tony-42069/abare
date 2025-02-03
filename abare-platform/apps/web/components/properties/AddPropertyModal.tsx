import { useState } from 'react';
import { Modal, TextInput, NumberInput, Select, Button, Stack } from '@mantine/core';
import { Property, PropertyType, RiskProfile } from '@abare/core';

interface AddPropertyModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (property: Omit<Property, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddPropertyModal({ opened, onClose, onSubmit }: AddPropertyModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>(PropertyType.Office);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [squareFeet, setSquareFeet] = useState<number>(0);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(RiskProfile.Core);
  const [yearBuilt, setYearBuilt] = useState<number | undefined>();
  const [occupancyRate, setOccupancyRate] = useState<number>(100);
  const [parkingSpaces, setParkingSpaces] = useState<number | undefined>();

  const handleSubmit = () => {
    onSubmit({
      name,
      type,
      address: {
        street,
        city,
        state,
        zipCode,
        country: 'USA'
      },
      squareFeet,
      riskProfile,
      yearBuilt,
      occupancyRate,
      parkingSpaces,
      status: 'active',
      marketId: 'default', // This should be selected from available markets
      tenants: []
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType(PropertyType.Office);
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setSquareFeet(0);
    setRiskProfile(RiskProfile.Core);
    setYearBuilt(undefined);
    setOccupancyRate(100);
    setParkingSpaces(undefined);
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title="Add New Property"
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Stack gap="md">
          <TextInput
            label="Property Name"
            placeholder="Enter property name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Property Type"
            value={type}
            onChange={(value) => setType(value as PropertyType)}
            data={Object.values(PropertyType).map(type => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1)
            }))}
            required
          />

          <TextInput
            label="Street Address"
            placeholder="Enter street address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
          />

          <TextInput
            label="City"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />

          <TextInput
            label="State"
            placeholder="Enter state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />

          <TextInput
            label="ZIP Code"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />

          <NumberInput
            label="Square Feet"
            placeholder="Enter total square feet"
            value={squareFeet}
            onChange={(value) => setSquareFeet(typeof value === 'number' ? value : 0)}
            min={0}
            required
          />

          <Select
            label="Risk Profile"
            value={riskProfile}
            onChange={(value) => setRiskProfile(value as RiskProfile)}
            data={Object.values(RiskProfile).map(profile => ({
              value: profile,
              label: profile.charAt(0).toUpperCase() + profile.slice(1)
            }))}
            required
          />

          <NumberInput
            label="Year Built"
            placeholder="Enter year built"
            value={yearBuilt}
            onChange={(value) => setYearBuilt(typeof value === 'number' ? value : undefined)}
            min={1800}
            max={new Date().getFullYear()}
          />

          <NumberInput
            label="Occupancy Rate (%)"
            placeholder="Enter occupancy rate"
            value={occupancyRate}
            onChange={(value) => setOccupancyRate(typeof value === 'number' ? value : 0)}
            min={0}
            max={100}
            required
          />

          <NumberInput
            label="Parking Spaces"
            placeholder="Enter number of parking spaces"
            value={parkingSpaces}
            onChange={(value) => setParkingSpaces(typeof value === 'number' ? value : undefined)}
            min={0}
          />

          <Button type="submit">Add Property</Button>
        </Stack>
      </form>
    </Modal>
  );
}
