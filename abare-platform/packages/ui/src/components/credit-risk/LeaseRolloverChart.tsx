import { Card, Text } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditRiskLevel } from '@abare/core';
import { LeaseRolloverChartProps } from '../../types/credit-risk';

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card shadow="sm" p="xs">
        <Text weight={500}>{data.month}</Text>
        <Text size="sm">Expiring Rent: ${data.expiringRent.toLocaleString()}</Text>
        <Text size="sm" color={getRiskColor(data.riskLevel)}>
          Risk Level: {data.riskLevel}
        </Text>
      </Card>
    );
  }
  return null;
};

export const LeaseRolloverChart = ({ data }: LeaseRolloverChartProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text weight={500} size="lg" mb="md">
        Lease Rollover Schedule
      </Text>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            domain={[0, Math.max(...data.map((d) => d.expiringRent)) * 1.1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expiringRent"
            stroke="#2ecc71"
            fill="#2ecc71"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
