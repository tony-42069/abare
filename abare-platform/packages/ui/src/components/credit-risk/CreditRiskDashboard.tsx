import { Grid, Container, Title, Group } from '@mantine/core';
import { CreditRiskLevel } from '@abare/core';
import { CreditRiskDashboardProps } from '../../types/credit-risk';
import { RiskScoreCard } from './RiskScoreCard';
import { TenantRiskCard } from './TenantRiskCard';
import { ConcentrationChart } from './ConcentrationChart';
import { LeaseRolloverChart } from './LeaseRolloverChart';

export const CreditRiskDashboard = ({ analysis, tenants, onTenantSelect }: CreditRiskDashboardProps) => {
  // Prepare data for concentration chart
  const concentrationData = analysis.concentrationRisk.map((concentration) => {
    const tenant = tenants.find((t) => t.id === concentration.tenantId);
    const risk = analysis.tenantRisks.find((r) => r.tenantId === concentration.tenantId);
    return {
      tenantName: tenant?.name || 'Unknown',
      percentOfRevenue: concentration.percentOfRevenue,
      riskLevel: risk?.creditRiskLevel || CreditRiskLevel.Moderate
    };
  });

  // Prepare data for lease rollover chart
  const rolloverData = analysis.tenantRisks.map((risk) => {
    const tenant = tenants.find((t) => t.id === risk.tenantId);
    const monthsLeft = risk.leaseTermRemaining;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsLeft);
    
    return {
      month: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      expiringRent: risk.monthlyRent * 12,
      riskLevel: risk.creditRiskLevel
    };
  }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">Credit Risk Analysis</Title>

      <Grid mb="xl">
        <Grid.Col span={3}>
          <RiskScoreCard
            score={100 - analysis.totalDefaultRisk * 100}
            level={analysis.overallRiskLevel}
            label="Overall Risk Score"
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <RiskScoreCard
            score={analysis.weightedAverageLeaseLength}
            level={analysis.weightedAverageLeaseLength > 60 ? CreditRiskLevel.Low : 
                   analysis.weightedAverageLeaseLength > 36 ? CreditRiskLevel.Moderate :
                   analysis.weightedAverageLeaseLength > 24 ? CreditRiskLevel.High :
                   CreditRiskLevel.Severe}
            label="Avg. Lease Term (Months)"
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <RiskScoreCard
            score={analysis.marketVolatility * 100}
            level={analysis.marketVolatility > 0.2 ? CreditRiskLevel.Severe :
                   analysis.marketVolatility > 0.15 ? CreditRiskLevel.High :
                   analysis.marketVolatility > 0.1 ? CreditRiskLevel.Moderate :
                   CreditRiskLevel.Low}
            label="Market Volatility"
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <RiskScoreCard
            score={analysis.portfolioImpact.netRiskAdjustment * 100}
            level={analysis.portfolioImpact.netRiskAdjustment > 0.1 ? CreditRiskLevel.Low :
                   analysis.portfolioImpact.netRiskAdjustment > 0 ? CreditRiskLevel.Moderate :
                   analysis.portfolioImpact.netRiskAdjustment > -0.1 ? CreditRiskLevel.High :
                   CreditRiskLevel.Severe}
            label="Portfolio Impact"
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
        {analysis.tenantRisks.map((risk) => {
          const tenant = tenants.find((t) => t.id === risk.tenantId);
          const concentration = analysis.concentrationRisk.find(
            (c) => c.tenantId === risk.tenantId
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
