// Credit Risk Types
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
  marketRentDelta: number;  // Difference from market rent
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

// Base Types
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

// Document Types
export type DocumentType = 'lease' | 'rentRoll' | 'operatingStatement' | 'plStatement' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: Date;
  propertyId: string;
  content: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: Record<string, any>;
}

// Property Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: Address;
  squareFeet: number;
  documents: Document[];
  riskProfile: RiskProfile;
  yearBuilt?: number;
  lastRenovated?: number;
  occupancyRate: number;
  tenants?: string[];
  amenities?: string[];
  parkingSpaces?: number;
  marketId: string;
  status: 'active' | 'pending' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// Market Types
export interface Market {
  id: string;
  name: string;
  state: string;
  type: 'primary' | 'secondary' | 'tertiary';
  metrics: {
    population: number;
    employmentGrowth: number;
    medianIncome: number;
  };
}

// Analysis Types
export interface BaseAnalysis {
  id: string;
  propertyId: string;
  type: 'financial' | 'market' | 'risk';
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'completed' | 'error';
  version: number;
}

// Type Guards
export function isDocument(obj: any): obj is Document {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    ['lease', 'rentRoll', 'operatingStatement', 'plStatement', 'other'].includes(obj.type) &&
    obj.uploadDate instanceof Date &&
    typeof obj.propertyId === 'string' &&
    typeof obj.content === 'string' &&
    ['pending', 'processing', 'completed', 'error'].includes(obj.status)
  );
}

export function isAddress(obj: any): obj is Address {
  return (
    typeof obj === 'object' &&
    typeof obj.street === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.zipCode === 'string' &&
    typeof obj.country === 'string'
  );
}

export function isProperty(obj: any): obj is Property {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Object.values(PropertyType).includes(obj.type) &&
    isAddress(obj.address) &&
    typeof obj.squareFeet === 'number' &&
    Array.isArray(obj.documents) &&
    obj.documents.every(isDocument) &&
    Object.values(RiskProfile).includes(obj.riskProfile) &&
    typeof obj.occupancyRate === 'number' &&
    typeof obj.marketId === 'string' &&
    ['active', 'pending', 'archived'].includes(obj.status) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isMarket(obj: any): obj is Market {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.state === 'string' &&
    ['primary', 'secondary', 'tertiary'].includes(obj.type) &&
    typeof obj.metrics === 'object' &&
    typeof obj.metrics.population === 'number' &&
    typeof obj.metrics.employmentGrowth === 'number' &&
    typeof obj.metrics.medianIncome === 'number'
  );
}

export function isBaseAnalysis(obj: any): obj is BaseAnalysis {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.propertyId === 'string' &&
    ['financial', 'market', 'risk'].includes(obj.type) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    ['pending', 'completed', 'error'].includes(obj.status) &&
    typeof obj.version === 'number'
  );
}

export function isTenantProfile(obj: any): obj is TenantProfile {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Object.values(IndustryType).includes(obj.industry) &&
    typeof obj.yearsInBusiness === 'number' &&
    typeof obj.publicCompany === 'boolean'
  );
}

export function isLeaseRisk(obj: any): obj is LeaseRisk {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.tenantId === 'string' &&
    typeof obj.leaseTermRemaining === 'number' &&
    typeof obj.monthlyRent === 'number' &&
    typeof obj.rentPerSqFt === 'number' &&
    typeof obj.escalations === 'number' &&
    typeof obj.securityDeposit === 'number' &&
    typeof obj.defaultProbability === 'number' &&
    typeof obj.marketRentDelta === 'number' &&
    Object.values(CreditRiskLevel).includes(obj.creditRiskLevel)
  );
}

export function isTenantConcentration(obj: any): obj is TenantConcentration {
  return (
    typeof obj === 'object' &&
    typeof obj.tenantId === 'string' &&
    typeof obj.squareFootage === 'number' &&
    typeof obj.percentOfTotal === 'number' &&
    typeof obj.annualRent === 'number' &&
    typeof obj.percentOfRevenue === 'number' &&
    typeof obj.industryExposure === 'number'
  );
}

export function isCreditRiskAnalysis(obj: any): obj is CreditRiskAnalysis {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.propertyId === 'string' &&
    Object.values(CreditRiskLevel).includes(obj.overallRiskLevel) &&
    Array.isArray(obj.tenantRisks) &&
    obj.tenantRisks.every(isLeaseRisk) &&
    Array.isArray(obj.concentrationRisk) &&
    obj.concentrationRisk.every(isTenantConcentration) &&
    typeof obj.weightedAverageLeaseLength === 'number' &&
    typeof obj.totalDefaultRisk === 'number' &&
    typeof obj.marketVolatility === 'number' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}
