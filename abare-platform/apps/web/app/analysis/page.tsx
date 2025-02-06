'use client';

import { useState } from 'react';
import { Container, Title, Stack } from '@mantine/core';
import { AnalysisCreation } from '@/components/analysis/AnalysisCreation';
import { AnalysisResults } from '@/components/analysis/AnalysisResults';

export default function AnalysisPage() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const handleAnalysisCreated = (analysisId: string) => {
    setCurrentAnalysisId(analysisId);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={1}>Analysis</Title>

        {!currentAnalysisId ? (
          <AnalysisCreation onAnalysisCreated={handleAnalysisCreated} />
        ) : (
          <AnalysisResults analysisId={currentAnalysisId} />
        )}
      </Stack>
    </Container>
  );
}
