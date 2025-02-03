import { CreditRiskAnalysis, CreditRiskLevel, TenantProfile } from '@abare/core';

export interface RiskScoreCardProps {
  score: number;
  level: CreditRiskLevel;
  trend?: 'up' | 'down' | 'stable';
  label: string;
}

export interface TenantRiskCardProps {
  tenant: TenantProfile;
  riskScore: number;
  riskLevel: CreditRiskLevel;
  concentration: number;
  leaseTermRemaining: number;
}

export interface ConcentrationChartProps {
  data: Array<{
    tenantName: string;
    percentOfRevenue: number;
    riskLevel: CreditRiskLevel;
  }>;
}

export interface LeaseRolloverChartProps {
  data: Array<{
    month: string;
    expiringRent: number;
    riskLevel: CreditRiskLevel;
  }>;
}

export interface CreditRiskDashboardProps {
  analysis: CreditRiskAnalysis;
  tenants: TenantProfile[];
  onTenantSelect?: (tenantId: string) => void;
}
