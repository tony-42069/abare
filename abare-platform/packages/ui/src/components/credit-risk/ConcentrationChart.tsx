import { Card, Text } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditRiskLevel } from '@abare/core';
import { ConcentrationChartProps } from '../../types/credit-risk';

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
        <Text weight={500}>{data.tenantName}</Text>
        <Text size="sm">Revenue: {data.percentOfRevenue.toFixed(1)}%</Text>
        <Text size="sm" color={getRiskColor(data.riskLevel)}>
          Risk Level: {data.riskLevel}
        </Text>
      </Card>
    );
  }
  return null;
};

export const ConcentrationChart = ({ data }: ConcentrationChartProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text weight={500} size="lg" mb="md">
        Tenant Concentration
      </Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="tenantName"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={[0, Math.max(...data.map((d) => d.percentOfRevenue)) + 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="percentOfRevenue"
            fill="#2ecc71"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
