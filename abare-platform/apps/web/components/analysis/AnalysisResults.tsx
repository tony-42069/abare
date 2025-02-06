'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Grid,
  Paper,
  Loader,
  Alert,
} from '@mantine/core';
import { IconDownload, IconAlertCircle } from '@tabler/icons-react';
import { LineChart } from '@mantine/charts';

interface AnalysisResult {
  id: string;
  type: string;
  timeframe: number;
  metrics: {
    noi: number[];
    capRate: number[];
    cashFlow: number[];
    occupancy: number[];
  };
  summary: string;
  recommendations: string[];
  timestamp: string;
}

interface AnalysisResultsProps {
  analysisId: string;
}

export function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/analysis/${analysisId}`);
        if (!response.ok) throw new Error('Failed to fetch analysis results');

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [analysisId]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <Stack align="center" gap="md">
        <Loader size="xl" />
        <Text>Loading analysis results...</Text>
      </Stack>
    );
  }

  if (error || !results) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
        {error || 'Failed to load analysis results'}
      </Alert>
    );
  }

  const chartData = Array.from({ length: results.timeframe }, (_, i) => ({
    month: `Month ${i + 1}`,
    noi: results.metrics.noi[i],
    capRate: results.metrics.capRate[i],
    cashFlow: results.metrics.cashFlow[i],
    occupancy: results.metrics.occupancy[i],
  }));

  return (
    <Stack gap="md">
      <Card shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={2}>Analysis Results</Title>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Group>

        <Grid>
          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Title order={3} mb="md">Key Metrics</Title>
              <LineChart
                h={300}
                data={chartData}
                dataKey="month"
                series={[
                  { name: 'NOI', color: 'blue.6' },
                  { name: 'Cap Rate', color: 'green.6' },
                  { name: 'Cash Flow', color: 'yellow.6' },
                  { name: 'Occupancy', color: 'grape.6' },
                ]}
                curveType="monotone"
                withLegend
                withTooltip
                gridAxis="xy"
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Title order={3} mb="md">Summary</Title>
              <Text>{results.summary}</Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Title order={3} mb="md">Recommendations</Title>
              <Stack gap="sm">
                {results.recommendations.map((rec, index) => (
                  <Text key={index}>{rec}</Text>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  );
}
