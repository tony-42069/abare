import { Grid, Container, Title } from '@mantine/core';
import { CreditRiskDashboardProps, ConcentrationChartProps, LeaseRolloverChartProps } from '../../types/credit-risk';
import { CreditRiskLevel, TenantConcentration, LeaseRisk } from '@abare/core/src/types';
import { StatsCard } from '../common/StatsCard';
import { IconChartBar, IconCalendarTime, IconChartLine, IconBuildingBank } from '@tabler/icons-react';
import { TenantRiskCard } from './TenantRiskCard';
import { ConcentrationChart } from './ConcentrationChart';
import { LeaseRolloverChart } from './LeaseRolloverChart';

export const CreditRiskDashboard = ({ analysis, tenants, onTenantSelect }: CreditRiskDashboardProps) => {
  // Prepare data for concentration chart
  const concentrationData: ConcentrationChartProps['data'] = analysis.concentrationRisk.map((concentration: TenantConcentration) => {
    const tenant = tenants.find((t) => t.id === concentration.tenantId);
    const risk = analysis.tenantRisks.find((r: LeaseRisk) => r.tenantId === concentration.tenantId);
    return {
      tenantName: tenant?.name || 'Unknown',
      percentOfRevenue: concentration.percentOfRevenue,
      riskLevel: risk?.creditRiskLevel || CreditRiskLevel.Moderate
    };
  });

  // Prepare data for lease rollover chart
  const rolloverData: LeaseRolloverChartProps['data'] = analysis.tenantRisks.map((risk: LeaseRisk) => {
    const tenant = tenants.find((t) => t.id === risk.tenantId);
    const monthsLeft = risk.leaseTermRemaining;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsLeft);
    
    return {
      month: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      expiringRent: risk.monthlyRent * 12,
      riskLevel: risk.creditRiskLevel
    };
  }).sort((a: { month: string }, b: { month: string }) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Calculate trends based on historical data (mocked for now)
  const riskScoreTrend = -5;
  const leaseTermTrend = 2;
  const volatilityTrend = 8;
  const portfolioImpactTrend = -3;

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">Credit Risk Analysis</Title>

      <Grid mb="xl">
        <Grid.Col span={3}>
          <StatsCard
            title="Overall Risk Score"
            value={Math.round(100 - analysis.totalDefaultRisk * 100)}
            trend={riskScoreTrend}
            icon={<IconChartBar size={20} />}
            description="Based on tenant mix and market conditions"
            gradient={['#1971c2', '#228be6']}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatsCard
            title="Avg. Lease Term"
            value={Math.round(analysis.weightedAverageLeaseLength)}
            trend={leaseTermTrend}
            icon={<IconCalendarTime size={20} />}
            description="Weighted average lease length in months"
            gradient={['#2f9e44', '#40c057']}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatsCard
            title="Market Volatility"
            value={`${(analysis.marketVolatility * 100).toFixed(1)}%`}
            trend={volatilityTrend}
            icon={<IconChartLine size={20} />}
            description="Current market volatility index"
            gradient={['#e8590c', '#fd7e14']}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatsCard
            title="Portfolio Impact"
            value={`${(analysis.portfolioImpact.netRiskAdjustment * 100).toFixed(1)}%`}
            trend={portfolioImpactTrend}
            icon={<IconBuildingBank size={20} />}
            description="Net impact on portfolio risk profile"
            gradient={['#5f3dc4', '#7048e8']}
          />
        </Grid.Col>
      </Grid>

      <Grid mb="xl">
        <Grid.Col span={8}>
          <ConcentrationChart data={concentrationData} />
        </Grid.Col>
        <Grid.Col span={4}>
          <LeaseRolloverChart data={rolloverData} />
        </Grid.Col>
      </Grid>

      <Title order={3} mb="lg">Tenant Risk Profiles</Title>
      <Grid>
        {analysis.tenantRisks.map((risk: LeaseRisk) => {
          const tenant = tenants.find((t) => t.id === risk.tenantId);
          const concentration = analysis.concentrationRisk.find(
            (c: TenantConcentration) => c.tenantId === risk.tenantId
          );

          if (!tenant || !concentration) return null;

          return (
            <Grid.Col key={risk.tenantId} span={4}>
              <div
                style={{ cursor: onTenantSelect ? 'pointer' : 'default' }}
                onClick={() => onTenantSelect?.(risk.tenantId)}
              >
                <TenantRiskCard
                  tenant={tenant}
                  riskScore={100 - risk.defaultProbability * 100}
                  riskLevel={risk.creditRiskLevel}
                  concentration={concentration.percentOfRevenue}
                  leaseTermRemaining={risk.leaseTermRemaining}
                />
              </div>
            </Grid.Col>
          );
        })}
      </Grid>
    </Container>
  );
};
