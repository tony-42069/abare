export enum CreditRiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Severe = 'severe'
}

export interface TenantRisk {
  id: string;
  tenantId: string;
  leaseTermRemaining: number;
  monthlyRent: number;
  rentPerSqFt: number;
  escalations: number;
  securityDeposit: number;
  defaultProbability: number;
  marketRentDelta: number;
  creditRiskLevel: CreditRiskLevel;
}

export interface ConcentrationRisk {
  tenantId: string;
  squareFootage: number;
  percentOfTotal: number;
  annualRent: number;
  percentOfRevenue: number;
  industryExposure: number;
}

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  creditScore: number;
  annualRevenue: number;
  yearsInBusiness: number;
  publicCompany: boolean;
  employeeCount: number;
}

export interface CreditRiskAnalysis {
  id: string;
  propertyId: string;
  overallRiskLevel: CreditRiskLevel;
  tenantRisks: TenantRisk[];
  concentrationRisk: ConcentrationRisk[];
  weightedAverageLeaseLength: number;
  totalDefaultRisk: number;
  marketVolatility: number;
  portfolioImpact: {
    diversificationBenefit: number;
    concentrationPenalty: number;
    netRiskAdjustment: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditRiskDashboardData {
  analysis: CreditRiskAnalysis;
  tenants: Tenant[];
}

// Interfaces for compatibility with analytics package
export enum IndustryType {
  Technology = 'technology',
  Finance = 'finance',
  Healthcare = 'healthcare',
  Retail = 'retail',
  Manufacturing = 'manufacturing',
  Professional = 'professional',
  Government = 'government',
  Other = 'other'
}

export interface TenantProfile {
  id: string;
  name: string;
  industry: IndustryType;
  creditScore?: number;
  annualRevenue?: number;
  yearsInBusiness: number;
  publicCompany: boolean;
  parentCompany?: string;
  employeeCount?: number;
}

export interface LeaseRisk {
  id: string;
  tenantId: string;
  leaseTermRemaining: number;
  monthlyRent: number;
  rentPerSqFt: number;
  escalations: number;
  securityDeposit: number;
  defaultProbability: number;
  marketRentDelta: number;
  creditRiskLevel: CreditRiskLevel;
}

export interface TenantConcentration {
  tenantId: string;
  squareFootage: number;
  percentOfTotal: number;
  annualRent: number;
  percentOfRevenue: number;
  industryExposure: number;
}