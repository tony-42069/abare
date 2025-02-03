import { Card, Text, Group, Stack, Progress } from '@mantine/core';
import { CreditRiskLevel, IndustryType } from '@abare/core';
import { TenantRiskCardProps } from '../../types/credit-risk';

const getRiskColor = (level: CreditRiskLevel): string => {
  switch (level) {
    case CreditRiskLevel.Low:
      return '#2ecc71';
    case CreditRiskLevel.Moderate:
      return '#f1c40f';
    case CreditRiskLevel.High:
      return '#e67e22';
    case CreditRiskLevel.Severe:
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
};

const formatIndustry = (industry: IndustryType): string => {
  return industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
};

export const TenantRiskCard = ({
  tenant,
  riskScore,
  riskLevel,
  concentration,
  leaseTermRemaining,
}: TenantRiskCardProps) => {
  const color = getRiskColor(riskLevel);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" mb="xs">
        <Text weight={700} size="lg">
          {tenant.name}
        </Text>
        <Text size="sm" color="dimmed">
          {formatIndustry(tenant.industry)}
        </Text>
      </Group>

      <Stack spacing="xs">
        <Group position="apart">
          <Text size="sm">Risk Score</Text>
          <Text weight={700} color={color}>
            {riskScore.toFixed(0)}
          </Text>
        </Group>
        <Progress
          value={riskScore}
          color={color}
          size="sm"
          radius="xl"
        />

        <Group position="apart" mt="md">
          <Text size="sm">Concentration</Text>
          <Text weight={500}>
            {concentration.toFixed(1)}%
          </Text>
        </Group>

        <Group position="apart">
          <Text size="sm">Lease Term Remaining</Text>
          <Text weight={500}>
            {leaseTermRemaining} months
          </Text>
        </Group>

        <Group position="apart">
          <Text size="sm">Years in Business</Text>
          <Text weight={500}>
            {tenant.yearsInBusiness}
          </Text>
        </Group>

        {tenant.annualRevenue && (
          <Group position="apart">
            <Text size="sm">Annual Revenue</Text>
            <Text weight={500}>
              ${(tenant.annualRevenue / 1000000).toFixed(1)}M
            </Text>
          </Group>
        )}

        <Group position="apart">
          <Text size="sm">Public Company</Text>
          <Text weight={500}>
            {tenant.publicCompany ? 'Yes' : 'No'}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
