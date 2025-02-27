import {
  CreditRiskLevel,
  TenantProfile,
  LeaseRisk,
  TenantConcentration,
  CreditRiskAnalysis,
  IndustryType
} from './core-types';
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
 * Get industry risk factor based on industry type
 */
function getIndustryRiskFactor(industry: IndustryType): number {
  const industryRiskMap: Record<IndustryType, number> = {
    [IndustryType.Technology]: 0.85,
    [IndustryType.Finance]: 0.80,
    [IndustryType.Healthcare]: 0.90,
    [IndustryType.Retail]: 0.70,
    [IndustryType.Manufacturing]: 0.75,
    [IndustryType.Professional]: 0.85,
    [IndustryType.Government]: 0.95,
    [IndustryType.Other]: 0.65
  };
  
  return industryRiskMap[industry] || 0.65;
}

/**
 * Calculate tenant credit risk based on tenant profile
 */
export function calculateTenantRiskProfile(
  tenant: TenantProfile,
  leaseRisk: LeaseRisk,
  concentration: TenantConcentration,
  marketData: {
    industryGrowth: number;
    marketRent: number;
    vacancyRate: number;
    economicIndex: number;
  }
): TenantRiskProfile {
  // Calculate risk factors (0-1 scale, higher is better)
  const industryRisk = getIndustryRiskFactor(tenant.industry);
  
  const marketPosition = Math.min(
    0.95,
    (tenant.annualRevenue || 0) / 10000000 * 0.5 + 
    (tenant.publicCompany ? 0.2 : 0) +
    (tenant.yearsInBusiness / 20) * 0.3
  );
  
  const financialStrength = Math.min(
    1,
    ((tenant.creditScore || 600) - 500) / 300
  );
  
  const operatingHistory = Math.min(
    0.95,
    tenant.yearsInBusiness / 15
  );
  
  const paymentHistory = 0.85; // Placeholder - would need payment data
  
  const marketConditions = (
    marketData.industryGrowth * 0.3 +
    (1 - marketData.vacancyRate) * 0.3 +
    marketData.economicIndex * 0.4
  );
  
  // Compile risk factors
  const factors: CreditRiskFactors = {
    industryRisk,
    marketPosition,
    financialStrength,
    operatingHistory,
    paymentHistory,
    marketConditions
  };
  
  // Calculate base risk score
  const baseScore = calculateWeightedScore(factors);
  
  // Apply adjustments
  const leaseAdjustment = leaseRisk.leaseTermRemaining > 5 ? 5 : 
                       leaseRisk.leaseTermRemaining < 1 ? -10 : 0;
  
  const concentrationAdjustment = concentration.percentOfRevenue > 0.3 ? -10 : 
                              concentration.percentOfRevenue > 0.2 ? -5 : 0;
  
  const marketAdjustment = leaseRisk.marketRentDelta > 0.2 ? -5 :
                        leaseRisk.marketRentDelta < -0.1 ? 5 : 0;
  
  // Calculate adjusted score
  const adjustedScore = Math.min(100, Math.max(0, 
    baseScore + leaseAdjustment + concentrationAdjustment + marketAdjustment
  ));
  
  // Determine risk level
  const riskLevel = calculateRiskLevel(adjustedScore);
  
  // Create credit risk calculation
  const creditRisk: CreditRiskCalculation = {
    tenantId: tenant.id,
    factors,
    weights: DEFAULT_WEIGHTS,
    baseScore,
    adjustedScore,
    riskLevel,
    confidenceLevel: 0.85 // Confidence in the assessment
  };
  
  // Calculate market comparison metrics
  const marketComparison = {
    rentDelta: leaseRisk.marketRentDelta,
    industryPerformance: marketData.industryGrowth,
    marketShare: 0.05, // Placeholder - would need market data
    growthRate: 0.03 // Placeholder - would need historical data
  };
  
  // Return complete tenant risk profile
  return {
    ...tenant,
    creditRisk,
    leaseRisk,
    concentration,
    marketComparison
  };
}

/**
 * Calculate property credit analysis based on tenant profiles
 */
export function calculatePropertyCreditAnalysis(
  propertyId: string,
  tenants: TenantProfile[],
  leaseRisks: LeaseRisk[],
  concentrations: TenantConcentration[],
  marketData: {
    industryGrowth: Record<IndustryType, number>;
    marketRent: number;
    vacancyRate: number;
    economicIndex: number;
  }
): PropertyCreditAnalysis {
  // Check for empty data
  if (tenants.length === 0 || leaseRisks.length === 0 || concentrations.length === 0) {
    throw new Error('Cannot calculate credit analysis with empty data');
  }
  
  // Calculate risk profile for each tenant
  const tenantProfiles: TenantRiskProfile[] = tenants.map(tenant => {
    const leaseRisk = leaseRisks.find(lr => lr.tenantId === tenant.id);
    const concentration = concentrations.find(c => c.tenantId === tenant.id);
    
    if (!leaseRisk || !concentration) {
      throw new Error(`Missing lease risk or concentration data for tenant ${tenant.id}`);
    }
    
    return calculateTenantRiskProfile(
      tenant,
      leaseRisk,
      concentration,
      {
        industryGrowth: marketData.industryGrowth[tenant.industry] || 0.02,
        marketRent: marketData.marketRent,
        vacancyRate: marketData.vacancyRate,
        economicIndex: marketData.economicIndex
      }
    );
  });
  
  // Calculate weighted average lease length
  const totalRent = leaseRisks.reduce((sum, lease) => sum + lease.monthlyRent, 0);
  const weightedAverageLeaseLength = leaseRisks.reduce((sum, lease) => {
    const weight = lease.monthlyRent / totalRent;
    return sum + (lease.leaseTermRemaining * weight);
  }, 0);
  
  // Calculate total default risk (weighted by rent)
  const totalDefaultRisk = leaseRisks.reduce((sum, lease) => {
    const weight = lease.monthlyRent / totalRent;
    return sum + (lease.defaultProbability * weight);
  }, 0);
  
  // Calculate market volatility based on market conditions
  const marketVolatility = 0.15; // Placeholder - would need historical data
  
  // Calculate overall risk level based on tenant profiles
  const overallRiskScore = tenantProfiles.reduce((sum, profile) => {
    const weight = profile.concentration.percentOfRevenue;
    return sum + (profile.creditRisk.adjustedScore * weight);
  }, 0);
  
  const overallRiskLevel = calculateRiskLevel(overallRiskScore);
  
  // Calculate portfolio impact
  const diversificationBenefit = Math.min(10, tenantProfiles.length);
  const concentrationPenalty = concentrations.some(c => c.percentOfRevenue > 0.3) ? 15 : 
                            concentrations.some(c => c.percentOfRevenue > 0.2) ? 10 : 5;
  const netRiskAdjustment = diversificationBenefit - concentrationPenalty;
  
  // Generate industry trends
  const industryTrends: Record<string, number> = {};
  Object.values(IndustryType).forEach(industry => {
    industryTrends[industry] = marketData.industryGrowth[industry as IndustryType] || 0.02;
  });
  
  // Generate market context
  const marketContext = {
    industryTrends,
    marketRents: {
      average: marketData.marketRent,
      median: marketData.marketRent * 0.98, // Placeholder
      standardDev: marketData.marketRent * 0.1 // Placeholder
    },
    vacancyRates: {
      market: marketData.vacancyRate,
      submarket: marketData.vacancyRate * 0.9, // Placeholder
      property: leaseRisks.length > 0 ? 0 : 1 // Simplified - would need property data
    }
  };
  
  // Generate recommendations
  const recommendations = {
    riskMitigation: [] as string[],
    tenantRetention: [] as string[],
    leaseStructure: [] as string[],
    portfolioBalance: [] as string[]
  };
  
  // Add risk mitigation recommendations
  if (overallRiskLevel === CreditRiskLevel.High || overallRiskLevel === CreditRiskLevel.Severe) {
    recommendations.riskMitigation.push('Consider requiring additional security deposits from high-risk tenants');
    recommendations.riskMitigation.push('Implement more frequent financial monitoring of tenants');
  }
  
  // Add tenant retention recommendations
  const highValueTenants = tenantProfiles.filter(tp => 
    tp.creditRisk.riskLevel === CreditRiskLevel.Low && 
    tp.concentration.percentOfRevenue > 0.1
  );
  
  if (highValueTenants.length > 0) {
    recommendations.tenantRetention.push('Develop retention strategy for high-value tenants with good credit');
    recommendations.tenantRetention.push('Consider early lease renewal offers to secure long-term tenancy');
  }
  
  // Add lease structure recommendations
  if (weightedAverageLeaseLength < 3) {
    recommendations.leaseStructure.push('Work to extend average lease terms to reduce rollover risk');
    recommendations.leaseStructure.push('Consider offering incentives for longer lease commitments');
  }
  
  // Add portfolio balance recommendations
  const highConcentrationIndustries = Object.entries(
    tenantProfiles.reduce((acc, tp) => {
      const industry = tp.industry;
      acc[industry] = (acc[industry] || 0) + tp.concentration.percentOfRevenue;
      return acc;
    }, {} as Record<string, number>)
  ).filter(([_, value]) => value > 0.3);
  
  if (highConcentrationIndustries.length > 0) {
    recommendations.portfolioBalance.push('Reduce concentration in high-exposure industries');
    recommendations.portfolioBalance.push('Target diversification across multiple industry sectors');
  }
  
  return {
    id: `cra-${Date.now()}`,
    propertyId,
    overallRiskLevel,
    tenantRisks: leaseRisks,
    concentrationRisk: concentrations,
    weightedAverageLeaseLength,
    totalDefaultRisk,
    marketVolatility,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantProfiles,
    portfolioImpact: {
      diversificationBenefit,
      concentrationPenalty,
      netRiskAdjustment
    },
    marketContext,
    recommendations
  };
}