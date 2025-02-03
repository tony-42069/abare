import { Card, Text, Group, RingProgress } from '@mantine/core';
import { CreditRiskLevel } from '@abare/core';
import { RiskScoreCardProps } from '../../types/credit-risk';

const getRiskColor = (level: CreditRiskLevel | undefined): string => {
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

const getTrendIcon = (trend?: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '';
  }
};

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ score, level, trend, label }) => {
  const color = getRiskColor(level);
  const trendIcon = getTrendIcon(trend);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" mt="md" mb="xs">
        <Text weight={500} size="lg">
          {label}
        </Text>
        {trend && (
          <Text color={trend === 'up' ? 'red' : trend === 'down' ? 'green' : 'gray'} weight={500}>
            {trendIcon}
          </Text>
        )}
      </Group>

      <RingProgress
        size={120}
        roundCaps
        thickness={8}
        sections={[{ value: score, color }]}
        label={
          <Text color={color} weight={700} align="center" size="xl">
            {score.toFixed(0)}
          </Text>
        }
      />

      <Text mt="md" color={color} weight={500} align="center">
        {level.toUpperCase()}
      </Text>
    </Card>
  );
};
