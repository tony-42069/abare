import { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Select,
  NumberInput,
  Textarea,
  Alert,
} from '@mantine/core';
import { IconCalculator, IconAlertCircle } from '@tabler/icons-react';

const ANALYSIS_TYPES = [
  { value: 'financial', label: 'Financial Analysis' },
  { value: 'market', label: 'Market Analysis' },
  { value: 'risk', label: 'Risk Assessment' },
  { value: 'valuation', label: 'Property Valuation' },
];

interface AnalysisParams {
  type: string;
  timeframe: number;
  assumptions: string;
}

interface AnalysisCreationProps {
  onAnalysisCreated: (analysisId: string) => void;
}

export function AnalysisCreation({ onAnalysisCreated }: AnalysisCreationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<AnalysisParams>({
    type: '',
    timeframe: 12,
    assumptions: '',
  });

  const handleSubmit = async () => {
    if (!params.type) {
      setError('Please select an analysis type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create analysis');
      }

      const data = await response.json();
      onAnalysisCreated(data.analysisId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
    setParams({ ...params, timeframe: isNaN(numericValue) ? 12 : numericValue });
  };

  return (
    <Stack gap="md">
      <Card shadow="sm">
        <Stack gap="md">
          <Title order={2}>Create Analysis</Title>
          
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <Select
            label="Analysis Type"
            placeholder="Select analysis type"
            data={ANALYSIS_TYPES}
            value={params.type}
            onChange={(value) => setParams({ ...params, type: value || '' })}
            required
          />

          <NumberInput
            label="Analysis Timeframe (months)"
            description="Period to analyze"
            value={params.timeframe}
            onChange={handleTimeframeChange}
            min={1}
            max={120}
            required
          />

          <Textarea
            label="Assumptions & Notes"
            description="Additional context and assumptions for the analysis"
            value={params.assumptions}
            onChange={(e) => setParams({ ...params, assumptions: e.target.value })}
            autosize
            minRows={3}
          />

          <Group justify="flex-end">
            <Button
              leftSection={<IconCalculator size={16} />}
              onClick={handleSubmit}
              loading={loading}
            >
              Run Analysis
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
