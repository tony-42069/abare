// Duplicate of core types for local use
export enum CreditRiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Severe = 'severe'
}

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

export interface CreditRiskAnalysis {
  id: string;
  propertyId: string;
  overallRiskLevel: CreditRiskLevel;
  tenantRisks: LeaseRisk[];
  concentrationRisk: TenantConcentration[];
  weightedAverageLeaseLength: number;
  totalDefaultRisk: number;
  marketVolatility: number;
  createdAt: Date;
  updatedAt: Date;
}

// Base types for property
export enum PropertyType {
  Office = 'office',
  Retail = 'retail',
  Industrial = 'industrial',
  Multifamily = 'multifamily',
  Mixed = 'mixed',
  Other = 'other'
}

export enum RiskProfile {
  Core = 'core',
  ValueAdd = 'valueAdd',
  Opportunistic = 'opportunistic'
}

export interface BaseAnalysis {
  id: string;
  propertyId: string;
  type: 'financial' | 'market' | 'risk';
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'completed' | 'error';
  version: number;
}