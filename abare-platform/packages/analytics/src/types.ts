import { 
  PropertyType, 
  RiskProfile, 
  BaseAnalysis, 
  CreditRiskLevel,
  TenantProfile,
  LeaseRisk,
  TenantConcentration,
  CreditRiskAnalysis
} from '@abare/core';

// Credit Risk Calculation Types
export interface CreditRiskFactors {
  industryRisk: number;
  marketPosition: number;
  financialStrength: number;
  operatingHistory: number;
  paymentHistory: number;
  marketConditions: number;
}

export interface CreditRiskWeights {
  industryRisk: number;
  marketPosition: number;
  financialStrength: number;
  operatingHistory: number;
  paymentHistory: number;
  marketConditions: number;
}

export interface CreditRiskCalculation {
  tenantId: string;
  factors: CreditRiskFactors;
  weights: CreditRiskWeights;
  baseScore: number;
  adjustedScore: number;
  riskLevel: CreditRiskLevel;
  confidenceLevel: number;
}

export interface TenantRiskProfile extends TenantProfile {
  creditRisk: CreditRiskCalculation;
  leaseRisk: LeaseRisk;
  concentration: TenantConcentration;
  marketComparison: {
    rentDelta: number;
    industryPerformance: number;
    marketShare: number;
    growthRate: number;
  };
}

export interface PropertyCreditAnalysis extends CreditRiskAnalysis {
  tenantProfiles: TenantRiskProfile[];
  portfolioImpact: {
    diversificationBenefit: number;
    concentrationPenalty: number;
    netRiskAdjustment: number;
  };
  marketContext: {
    industryTrends: Record<string, number>;
    marketRents: {
      average: number;
      median: number;
      standardDev: number;
    };
    vacancyRates: {
      market: number;
      submarket: number;
      property: number;
    };
  };
  recommendations: {
    riskMitigation: string[];
    tenantRetention: string[];
    leaseStructure: string[];
    portfolioBalance: string[];
  };
}

// Financial Analysis Types
export interface FinancialMetrics {
  noi: number;
  capRate: number;
  irr: number;
  cashOnCash: number;
  debtServiceCoverage: number;
  loanToValue: number;
  operatingExpenseRatio: number;
  breakEvenOccupancy: number;
}

// Investment Analysis Types
export interface InvestmentAnalysis extends BaseAnalysis {
  propertyType: PropertyType;
  riskProfile: RiskProfile;
  purchasePrice: number;
  squareFeet: number;
  occupancyRate: number;
  metrics: FinancialMetrics;
  assumptions: {
    rentGrowth: number;
    expenseGrowth: number;
    vacancyRate: number;
    capitalReserves: number;
    holdingPeriod: number;
    exitCapRate: number;
  };
  sensitivity: {
    capRateRange: [number, number];
    noiRange: [number, number];
    irrScenarios: {
      best: number;
      base: number;
      worst: number;
    };
  };
}

// Risk Analysis Types
export interface RiskAnalysis extends BaseAnalysis {
  propertyType: PropertyType;
  riskProfile: RiskProfile;
  marketRisk: {
    score: number;
    factors: {
      economicGrowth: number;
      employmentTrends: number;
      supplyDemand: number;
      marketLiquidity: number;
    };
  };
  tenantRisk: {
    score: number;
    factors: {
      creditQuality: number;
      tenantDiversity: number;
      leaseTerms: number;
      rolloverExposure: number;
    };
  };
  locationRisk: {
    score: number;
    factors: {
      accessibility: number;
      demographics: number;
      submarket: number;
      amenities: number;
    };
  };
  propertyConditionRisk: {
    score: number;
    factors: {
      age: number;
      maintenance: number;
      functionality: number;
      sustainability: number;
    };
  };
  overallRisk: number;
  recommendations: string[];
}

// Portfolio Analysis Types
export interface PortfolioAnalysis extends BaseAnalysis {
  properties: string[];
  aggregateMetrics: {
    totalValue: number;
    weightedCapRate: number;
    averageOccupancy: number;
    diversificationScore: number;
  };
  riskDistribution: {
    [K in RiskProfile]: number;
  };
  propertyTypeDistribution: {
    [K in PropertyType]: number;
  };
  correlationMatrix: {
    propertyIds: string[];
    values: number[][];
  };
}

// Credit Risk Type Guards
export function isCreditRiskFactors(obj: any): obj is CreditRiskFactors {
  return (
    typeof obj === 'object' &&
    typeof obj.industryRisk === 'number' &&
    typeof obj.marketPosition === 'number' &&
    typeof obj.financialStrength === 'number' &&
    typeof obj.operatingHistory === 'number' &&
    typeof obj.paymentHistory === 'number' &&
    typeof obj.marketConditions === 'number'
  );
}

export function isCreditRiskWeights(obj: any): obj is CreditRiskWeights {
  return (
    typeof obj === 'object' &&
    typeof obj.industryRisk === 'number' &&
    typeof obj.marketPosition === 'number' &&
    typeof obj.financialStrength === 'number' &&
    typeof obj.operatingHistory === 'number' &&
    typeof obj.paymentHistory === 'number' &&
    typeof obj.marketConditions === 'number'
  );
}

export function isCreditRiskCalculation(obj: any): obj is CreditRiskCalculation {
  return (
    typeof obj === 'object' &&
    typeof obj.tenantId === 'string' &&
    isCreditRiskFactors(obj.factors) &&
    isCreditRiskWeights(obj.weights) &&
    typeof obj.baseScore === 'number' &&
    typeof obj.adjustedScore === 'number' &&
    Object.values(CreditRiskLevel).includes(obj.riskLevel) &&
    typeof obj.confidenceLevel === 'number'
  );
}

export function isTenantRiskProfile(obj: any): obj is TenantRiskProfile {
  return (
    typeof obj === 'object' &&
    isCreditRiskCalculation(obj.creditRisk) &&
    typeof obj.marketComparison === 'object' &&
    typeof obj.marketComparison.rentDelta === 'number' &&
    typeof obj.marketComparison.industryPerformance === 'number' &&
    typeof obj.marketComparison.marketShare === 'number' &&
    typeof obj.marketComparison.growthRate === 'number'
  );
}

export function isPropertyCreditAnalysis(obj: any): obj is PropertyCreditAnalysis {
  return (
    typeof obj === 'object' &&
    Array.isArray(obj.tenantProfiles) &&
    obj.tenantProfiles.every(isTenantRiskProfile) &&
    typeof obj.portfolioImpact === 'object' &&
    typeof obj.marketContext === 'object' &&
    typeof obj.recommendations === 'object'
  );
}

// Type Guards
export function isFinancialMetrics(obj: any): obj is FinancialMetrics {
  return (
    typeof obj === 'object' &&
    typeof obj.noi === 'number' &&
    typeof obj.capRate === 'number' &&
    typeof obj.irr === 'number' &&
    typeof obj.cashOnCash === 'number' &&
    typeof obj.debtServiceCoverage === 'number' &&
    typeof obj.loanToValue === 'number' &&
    typeof obj.operatingExpenseRatio === 'number' &&
    typeof obj.breakEvenOccupancy === 'number'
  );
}

export function isInvestmentAnalysis(obj: any): obj is InvestmentAnalysis {
  return (
    typeof obj === 'object' &&
    Object.values(PropertyType).includes(obj.propertyType) &&
    Object.values(RiskProfile).includes(obj.riskProfile) &&
    typeof obj.purchasePrice === 'number' &&
    typeof obj.squareFeet === 'number' &&
    typeof obj.occupancyRate === 'number' &&
    isFinancialMetrics(obj.metrics) &&
    typeof obj.assumptions === 'object' &&
    typeof obj.sensitivity === 'object'
  );
}

export function isRiskAnalysis(obj: any): obj is RiskAnalysis {
  return (
    typeof obj === 'object' &&
    Object.values(PropertyType).includes(obj.propertyType) &&
    Object.values(RiskProfile).includes(obj.riskProfile) &&
    typeof obj.marketRisk === 'object' &&
    typeof obj.tenantRisk === 'object' &&
    typeof obj.locationRisk === 'object' &&
    typeof obj.propertyConditionRisk === 'object' &&
    typeof obj.overallRisk === 'number' &&
    Array.isArray(obj.recommendations)
  );
}

export function isPortfolioAnalysis(obj: any): obj is PortfolioAnalysis {
  return (
    typeof obj === 'object' &&
    Array.isArray(obj.properties) &&
    typeof obj.aggregateMetrics === 'object' &&
    typeof obj.riskDistribution === 'object' &&
    typeof obj.propertyTypeDistribution === 'object' &&
    typeof obj.correlationMatrix === 'object'
  );
}
