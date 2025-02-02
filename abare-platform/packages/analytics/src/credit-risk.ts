import {
  CreditRiskLevel,
  TenantProfile,
  LeaseRisk,
  TenantConcentration,
  CreditRiskAnalysis
} from '@abare/core';
import {
  CreditRiskFactors,
  CreditRiskWeights,
  CreditRiskCalculation,
  TenantRiskProfile,
  PropertyCreditAnalysis
} from './types';

// Default weights for credit risk factors
const DEFAULT_WEIGHTS: CreditRiskWeights = {
  industryRisk: 0.20,
  marketPosition: 0.15,
  financialStrength: 0.25,
  operatingHistory: 0.15,
  paymentHistory: 0.15,
  marketConditions: 0.10
};

// Risk level thresholds
const RISK_THRESHOLDS = {
  low: 80,
  moderate: 65,
  high: 50
};

/**
 * Calculate credit risk level based on score
 */
function calculateRiskLevel(score: number): CreditRiskLevel {
  if (score >= RISK_THRESHOLDS.low) return CreditRiskLevel.Low;
  if (score >= RISK_THRESHOLDS.moderate) return CreditRiskLevel.Moderate;
  if (score >= RISK_THRESHOLDS.high) return CreditRiskLevel.High;
  return CreditRiskLevel.Severe;
}

/**
 * Calculate weighted risk score
 */
function calculateWeightedScore(
  factors: CreditRiskFactors,
  weights: CreditRiskWeights = DEFAULT_WEIGHTS
): number {
  return (
    factors.industryRisk * weights.industryRisk +
    factors.marketPosition * weights.marketPosition +
    factors.financialStrength * weights.financialStrength +
    factors.operatingHistory * weights.operatingHistory +
    factors.paymentHistory * weights.paymentHistory +
    factors.marketConditions * weights.marketConditions
  ) * 100;
}

/**
 * Calculate market adjustment factor based on current market conditions
 */
function calculateMarketAdjustment(
  baseScore: number,
  marketConditions: number
): number {
  const adjustment = (marketConditions - 0.5) * 0.2; // +/- 10% adjustment
  return baseScore * (1 + adjustment);
}

/**
 * Calculate tenant concentration metrics
 */
function calculateConcentration(
  tenantRent: number,
  totalRent: number,
  tenantSqFt: number,
  totalSqFt: number,
  industryExposure: number
): TenantConcentration {
  return {
    tenantId: '', // Will be set by caller
    squareFootage: tenantSqFt,
    percentOfTotal: (tenantSqFt / totalSqFt) * 100,
    annualRent: tenantRent * 12,
    percentOfRevenue: (tenantRent * 12 / (totalRent * 12)) * 100,
    industryExposure
  };
}

/**
 * Calculate lease risk metrics
 */
function calculateLeaseRisk(
  lease: {
    termRemaining: number;
    monthlyRent: number;
    squareFeet: number;
    escalations: number;
    securityDeposit: number;
  },
  marketRent: number,
  creditRiskLevel: CreditRiskLevel
): LeaseRisk {
  const rentPerSqFt = lease.monthlyRent * 12 / lease.squareFeet;
  const marketRentPerSqFt = marketRent * 12;
  const marketRentDelta = ((rentPerSqFt - marketRentPerSqFt) / marketRentPerSqFt) * 100;

  // Calculate default probability based on credit risk level and lease terms
  const baseDefaultProb = {
    [CreditRiskLevel.Low]: 0.02,
    [CreditRiskLevel.Moderate]: 0.05,
    [CreditRiskLevel.High]: 0.10,
    [CreditRiskLevel.Severe]: 0.20
  }[creditRiskLevel];

  // Adjust for lease term and market rent delta
  const termAdjustment = Math.max(0, (60 - lease.termRemaining) / 60) * 0.05;
  const rentAdjustment = Math.max(0, marketRentDelta / 100) * 0.05;
  
  return {
    id: '', // Will be set by caller
    tenantId: '', // Will be set by caller
    leaseTermRemaining: lease.termRemaining,
    monthlyRent: lease.monthlyRent,
    rentPerSqFt,
    escalations: lease.escalations,
    securityDeposit: lease.securityDeposit,
    defaultProbability: baseDefaultProb + termAdjustment + rentAdjustment,
    marketRentDelta,
    creditRiskLevel
  };
}

/**
 * Calculate portfolio impact metrics
 */
function calculatePortfolioImpact(
  tenantConcentrations: TenantConcentration[],
  propertyCount: number
): PropertyCreditAnalysis['portfolioImpact'] {
  // Calculate Herfindahl-Hirschman Index for concentration
  const hhi = tenantConcentrations.reduce(
    (sum, tc) => sum + Math.pow(tc.percentOfRevenue / 100, 2),
    0
  );

  // Calculate diversification benefit (inverse of concentration)
  const diversificationBenefit = Math.max(0, (1 - hhi) * 0.15);

  // Calculate concentration penalty
  const concentrationPenalty = Math.min(0.15, hhi * 0.3);

  return {
    diversificationBenefit,
    concentrationPenalty,
    netRiskAdjustment: diversificationBenefit - concentrationPenalty
  };
}

/**
 * Calculate tenant risk profile including market comparisons
 */
export function calculateTenantRiskProfile(
  tenant: TenantProfile,
  lease: {
    termRemaining: number;
    monthlyRent: number;
    squareFeet: number;
    escalations: number;
    securityDeposit: number;
  },
  marketContext: {
    marketRent: number;
    industryGrowth: number;
    marketShare: number;
  },
  propertyMetrics: {
    totalRent: number;
    totalSqFt: number;
    industryExposure: number;
  }
): TenantRiskProfile {
  // Calculate base credit risk factors
  const factors: CreditRiskFactors = {
    industryRisk: tenant.industry === 'government' ? 0.9 : 0.7,
    marketPosition: tenant.publicCompany ? 0.8 : 0.6,
    financialStrength: tenant.annualRevenue ? Math.min(0.9, tenant.annualRevenue / 1000000000) : 0.5,
    operatingHistory: Math.min(0.9, tenant.yearsInBusiness / 20),
    paymentHistory: 0.8, // Would come from actual payment data
    marketConditions: 0.7 // Would come from market analysis
  };

  // Calculate credit risk
  const baseScore = calculateWeightedScore(factors);
  const adjustedScore = calculateMarketAdjustment(baseScore, factors.marketConditions);
  const riskLevel = calculateRiskLevel(adjustedScore);

  const creditRisk: CreditRiskCalculation = {
    tenantId: tenant.id,
    factors,
    weights: DEFAULT_WEIGHTS,
    baseScore,
    adjustedScore,
    riskLevel,
    confidenceLevel: 0.85
  };

  // Calculate lease risk
  const leaseRisk = calculateLeaseRisk(lease, marketContext.marketRent, riskLevel);
  leaseRisk.tenantId = tenant.id;

  // Calculate concentration
  const concentration = calculateConcentration(
    lease.monthlyRent,
    propertyMetrics.totalRent,
    lease.squareFeet,
    propertyMetrics.totalSqFt,
    propertyMetrics.industryExposure
  );
  concentration.tenantId = tenant.id;

  return {
    ...tenant,
    creditRisk,
    leaseRisk,
    concentration,
    marketComparison: {
      rentDelta: leaseRisk.marketRentDelta,
      industryPerformance: marketContext.industryGrowth,
      marketShare: marketContext.marketShare,
      growthRate: 0.05 // Would come from financial analysis
    }
  };
}

/**
 * Calculate property-level credit analysis
 */
export function calculatePropertyCreditAnalysis(
  propertyId: string,
  tenants: Array<{
    profile: TenantProfile;
    lease: {
      termRemaining: number;
      monthlyRent: number;
      squareFeet: number;
      escalations: number;
      securityDeposit: number;
    };
    marketContext: {
      marketRent: number;
      industryGrowth: number;
      marketShare: number;
    };
  }>,
  marketMetrics: {
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
  }
): PropertyCreditAnalysis {
  // Calculate total property metrics
  const totalRent = tenants.reduce((sum, t) => sum + t.lease.monthlyRent, 0);
  const totalSqFt = tenants.reduce((sum, t) => sum + t.lease.squareFeet, 0);
  
  // Calculate industry exposure
  const industryExposure = new Map<string, number>();
  tenants.forEach(t => {
    const exposure = (t.lease.monthlyRent / totalRent) * 100;
    industryExposure.set(t.profile.industry, 
      (industryExposure.get(t.profile.industry) || 0) + exposure);
  });

  // Calculate tenant risk profiles
  const tenantProfiles = tenants.map(t => calculateTenantRiskProfile(
    t.profile,
    t.lease,
    t.marketContext,
    {
      totalRent,
      totalSqFt,
      industryExposure: industryExposure.get(t.profile.industry) || 0
    }
  ));

  // Calculate portfolio impact
  const portfolioImpact = calculatePortfolioImpact(
    tenantProfiles.map(tp => tp.concentration),
    tenants.length
  );

  // Calculate weighted average lease length
  const weightedAverageLeaseLength = tenantProfiles.reduce(
    (sum, tp) => sum + (tp.leaseRisk.leaseTermRemaining * (tp.concentration.percentOfRevenue / 100)),
    0
  );

  // Calculate total default risk
  const totalDefaultRisk = tenantProfiles.reduce(
    (sum, tp) => sum + (tp.leaseRisk.defaultProbability * (tp.concentration.percentOfRevenue / 100)),
    0
  );

  // Determine overall risk level
  const overallRiskLevel = calculateRiskLevel(
    100 - (totalDefaultRisk * 100) + portfolioImpact.netRiskAdjustment
  );

  // Generate recommendations
  const recommendations = {
    riskMitigation: generateRiskMitigationRecommendations(tenantProfiles, overallRiskLevel),
    tenantRetention: generateTenantRetentionRecommendations(tenantProfiles),
    leaseStructure: generateLeaseStructureRecommendations(tenantProfiles),
    portfolioBalance: generatePortfolioBalanceRecommendations(tenantProfiles, portfolioImpact)
  };

  return {
    id: '', // Will be set by caller
    propertyId,
    overallRiskLevel,
    tenantRisks: tenantProfiles.map(tp => tp.leaseRisk),
    concentrationRisk: tenantProfiles.map(tp => tp.concentration),
    weightedAverageLeaseLength,
    totalDefaultRisk,
    marketVolatility: marketMetrics.marketRents.standardDev / marketMetrics.marketRents.average,
    tenantProfiles,
    portfolioImpact,
    marketContext: {
      industryTrends: marketMetrics.industryTrends,
      marketRents: marketMetrics.marketRents,
      vacancyRates: marketMetrics.vacancyRates
    },
    recommendations,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Helper functions for generating recommendations
function generateRiskMitigationRecommendations(
  tenantProfiles: TenantRiskProfile[],
  overallRiskLevel: CreditRiskLevel
): string[] {
  const recommendations: string[] = [];

  const highRiskTenants = tenantProfiles.filter(
    tp => tp.creditRisk.riskLevel === CreditRiskLevel.High || 
         tp.creditRisk.riskLevel === CreditRiskLevel.Severe
  );

  if (highRiskTenants.length > 0) {
    recommendations.push(
      `Consider increasing security deposits for ${highRiskTenants.length} high-risk tenants`
    );
  }

  if (overallRiskLevel === CreditRiskLevel.High || overallRiskLevel === CreditRiskLevel.Severe) {
    recommendations.push('Implement more frequent financial monitoring of tenants');
    recommendations.push('Consider credit default insurance for high-risk leases');
  }

  return recommendations;
}

function generateTenantRetentionRecommendations(
  tenantProfiles: TenantRiskProfile[]
): string[] {
  const recommendations: string[] = [];

  const nearTermExpirations = tenantProfiles.filter(
    tp => tp.leaseRisk.leaseTermRemaining < 24 && 
         tp.creditRisk.riskLevel !== CreditRiskLevel.Severe
  );

  if (nearTermExpirations.length > 0) {
    recommendations.push(
      `Initiate renewal discussions with ${nearTermExpirations.length} tenants expiring within 24 months`
    );
  }

  const aboveMarketTenants = tenantProfiles.filter(
    tp => tp.marketComparison.rentDelta > 10
  );

  if (aboveMarketTenants.length > 0) {
    recommendations.push(
      'Develop retention strategies for tenants paying above-market rents'
    );
  }

  return recommendations;
}

function generateLeaseStructureRecommendations(
  tenantProfiles: TenantRiskProfile[]
): string[] {
  const recommendations: string[] = [];

  const lowEscalations = tenantProfiles.filter(
    tp => tp.leaseRisk.escalations < 0.02
  );

  if (lowEscalations.length > 0) {
    recommendations.push(
      'Consider higher escalations in future lease negotiations'
    );
  }

  const lowDeposits = tenantProfiles.filter(
    tp => tp.leaseRisk.securityDeposit < tp.leaseRisk.monthlyRent * 2
  );

  if (lowDeposits.length > 0) {
    recommendations.push(
      'Evaluate security deposit requirements for future leases'
    );
  }

  return recommendations;
}

function generatePortfolioBalanceRecommendations(
  tenantProfiles: TenantRiskProfile[],
  portfolioImpact: PropertyCreditAnalysis['portfolioImpact']
): string[] {
  const recommendations: string[] = [];

  if (portfolioImpact.concentrationPenalty > 0.1) {
    recommendations.push(
      'Consider diversifying tenant mix to reduce concentration risk'
    );
  }

  const industries = new Map<string, number>();
  tenantProfiles.forEach(tp => {
    industries.set(tp.industry, 
      (industries.get(tp.industry) || 0) + tp.concentration.percentOfRevenue);
  });

  const dominantIndustry = Array.from(industries.entries())
    .reduce((a, b) => a[1] > b[1] ? a : b);

  if (dominantIndustry[1] > 40) {
    recommendations.push(
      `Consider reducing exposure to ${dominantIndustry[0]} industry (currently ${dominantIndustry[1].toFixed(1)}%)`
    );
  }

  return recommendations;
}
