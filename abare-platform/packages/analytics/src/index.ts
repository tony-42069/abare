import {
  FinancialMetrics,
  InvestmentAnalysis,
  RiskAnalysis,
  PortfolioAnalysis,
  isFinancialMetrics,
  isInvestmentAnalysis,
  isRiskAnalysis,
  isPortfolioAnalysis
} from './types';
import { PropertyType, RiskProfile } from '@abare/core';
import {
  MarketSpread,
  RateEnvironment,
  assessMarketRisk,
  analyzeSpread,
  HistoricalData
} from '@abare/market-data';

// Financial Analysis Functions
export function calculateFinancialMetrics(
  noi: number,
  purchasePrice: number,
  debtService: number,
  operatingExpenses: number,
  totalRevenue: number
): FinancialMetrics {
  return {
    noi,
    capRate: (noi / purchasePrice) * 100,
    irr: calculateIRR(noi, purchasePrice),
    cashOnCash: calculateCashOnCash(noi, debtService, purchasePrice),
    debtServiceCoverage: noi / debtService,
    loanToValue: calculateLTV(purchasePrice),
    operatingExpenseRatio: (operatingExpenses / totalRevenue) * 100,
    breakEvenOccupancy: calculateBreakEven(operatingExpenses, totalRevenue)
  };
}

// Investment Analysis Functions
export function analyzeInvestment(
  propertyId: string,
  propertyType: PropertyType,
  purchasePrice: number,
  noi: number,
  squareFeet: number,
  occupancyRate: number,
  marketData: RateEnvironment
): InvestmentAnalysis {
  const metrics = calculateFinancialMetrics(
    noi,
    purchasePrice,
    calculateDebtService(purchasePrice),
    calculateOperatingExpenses(squareFeet),
    calculateTotalRevenue(squareFeet, occupancyRate)
  );

  const marketRisk = assessMarketRisk(marketData);
  const riskProfile = determineRiskProfile(metrics, marketRisk.score);

  return {
    propertyId,
    propertyType,
    riskProfile,
    purchasePrice,
    squareFeet,
    occupancyRate,
    metrics,
    assumptions: generateAssumptions(propertyType, marketData),
    sensitivity: {
      capRateRange: [metrics.capRate - 1, metrics.capRate + 1] as [number, number],
      noiRange: [metrics.noi * 0.9, metrics.noi * 1.1] as [number, number],
      irrScenarios: {
        best: metrics.irr * 1.2,
        base: metrics.irr,
        worst: metrics.irr * 0.8
      }
    },
    id: generateAnalysisId(),
    type: 'financial',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1
  };
}

// Risk Analysis Functions
export function analyzeRisk(
  propertyId: string,
  propertyType: PropertyType,
  marketData: RateEnvironment,
  locationScore: number,
  propertyAge: number,
  tenantData: any
): RiskAnalysis {
  const marketRiskAssessment = assessMarketRisk(marketData);
  
  const marketRisk = {
    score: marketRiskAssessment.score,
    factors: {
      economicGrowth: calculateEconomicGrowthScore(marketData),
      employmentTrends: calculateEmploymentTrendScore(marketData),
      supplyDemand: calculateSupplyDemandScore(marketData),
      marketLiquidity: calculateMarketLiquidityScore(marketData)
    }
  };

  const tenantRisk = analyzeTenantRiskProfile(tenantData);
  const locationRisk = analyzeLocationRiskProfile(locationScore);
  const propertyConditionRisk = analyzePropertyConditionRisk(propertyAge);

  const overallRisk = calculateOverallRiskScore([
    marketRisk.score,
    tenantRisk.score,
    locationRisk.score,
    propertyConditionRisk.score
  ]);

  return {
    propertyId,
    propertyType,
    riskProfile: determineRiskProfile(null, overallRisk),
    marketRisk,
    tenantRisk,
    locationRisk,
    propertyConditionRisk,
    overallRisk,
    recommendations: generateRiskRecommendations(
      marketRisk,
      tenantRisk,
      locationRisk,
      propertyConditionRisk
    ),
    id: generateAnalysisId(),
    type: 'risk',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1
  };
}

// Portfolio Analysis Functions
export function analyzePortfolio(
  propertyId: string,
  properties: InvestmentAnalysis[],
  marketData: RateEnvironment
): PortfolioAnalysis {
  const totalValue = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
  
  return {
    propertyId,
    properties: properties.map(p => p.id),
    aggregateMetrics: {
      totalValue,
      weightedCapRate: calculateWeightedCapRateForPortfolio(properties),
      averageOccupancy: calculateAverageOccupancyRate(properties),
      diversificationScore: calculatePortfolioDiversification(properties)
    },
    riskDistribution: calculatePortfolioRiskDistribution(properties),
    propertyTypeDistribution: calculatePropertyTypeDistribution(properties),
    correlationMatrix: calculatePropertyCorrelations(properties),
    id: generateAnalysisId(),
    type: 'market',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1
  };
}

// Market Analysis Helper Functions
function calculateEconomicGrowthScore(marketData: RateEnvironment): number {
  const latestSofr = marketData.sofrRates[marketData.sofrRates.length - 1].rate;
  return Math.max(0, Math.min(1, 1 - (latestSofr / 10))); // Higher rates = lower growth score
}

function calculateEmploymentTrendScore(marketData: RateEnvironment): number {
  const spreadTrend = marketData.marketSpreads.slice(-6);
  const trendSlope = calculateTrendSlope(spreadTrend.map(s => s.spread));
  return Math.max(0, Math.min(1, 0.5 + trendSlope));
}

function calculateSupplyDemandScore(marketData: RateEnvironment): number {
  const recentSpreads = marketData.marketSpreads.slice(-3).map(s => s.spread);
  const avgSpread = recentSpreads.reduce((a, b) => a + b, 0) / recentSpreads.length;
  return Math.max(0, Math.min(1, 1 - (avgSpread / 300))); // Lower spreads = better supply/demand
}

function calculateMarketLiquidityScore(marketData: RateEnvironment): number {
  const volatility = calculateVolatility(marketData.marketSpreads.map(s => s.spread));
  return Math.max(0, Math.min(1, 1 - volatility));
}

// Risk Analysis Helper Functions
function analyzeTenantRiskProfile(tenantData: any) {
  return {
    score: 0.5, // Placeholder - implement actual tenant risk scoring
    factors: {
      creditQuality: 0.7,
      tenantDiversity: 0.6,
      leaseTerms: 0.8,
      rolloverExposure: 0.4
    }
  };
}

function analyzeLocationRiskProfile(locationScore: number) {
  return {
    score: Math.max(0, Math.min(1, locationScore)),
    factors: {
      accessibility: locationScore * 0.9,
      demographics: locationScore * 1.1,
      submarket: locationScore * 0.95,
      amenities: locationScore * 1.05
    }
  };
}

function analyzePropertyConditionRisk(propertyAge: number) {
  const baseScore = Math.max(0, Math.min(1, 1 - (propertyAge / 50)));
  return {
    score: baseScore,
    factors: {
      age: baseScore,
      maintenance: baseScore * 1.1,
      functionality: baseScore * 0.9,
      sustainability: baseScore * 0.95
    }
  };
}

// Portfolio Analysis Helper Functions
function calculateWeightedCapRateForPortfolio(properties: InvestmentAnalysis[]): number {
  const totalValue = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
  return properties.reduce((sum, p) => 
    sum + (p.metrics.capRate * (p.purchasePrice / totalValue)), 0);
}

function calculateAverageOccupancyRate(properties: InvestmentAnalysis[]): number {
  return properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length;
}

function calculatePortfolioDiversification(properties: InvestmentAnalysis[]): number {
  const typeDistribution = calculatePropertyTypeDistribution(properties);
  const maxConcentration = Math.max(...Object.values(typeDistribution));
  return 1 - (maxConcentration - (1 / Object.keys(typeDistribution).length));
}

function calculatePortfolioRiskDistribution(properties: InvestmentAnalysis[]): Record<RiskProfile, number> {
  const distribution = {
    [RiskProfile.Core]: 0,
    [RiskProfile.ValueAdd]: 0,
    [RiskProfile.Opportunistic]: 0
  };
  
  properties.forEach(p => {
    distribution[p.riskProfile]++;
  });

  const total = properties.length;
  Object.keys(distribution).forEach(key => {
    distribution[key as RiskProfile] = distribution[key as RiskProfile] / total;
  });

  return distribution;
}

function calculatePropertyTypeDistribution(properties: InvestmentAnalysis[]): Record<PropertyType, number> {
  const distribution = Object.values(PropertyType).reduce((acc, type) => ({
    ...acc,
    [type]: 0
  }), {} as Record<PropertyType, number>);

  properties.forEach(p => {
    distribution[p.propertyType]++;
  });

  const total = properties.length;
  Object.keys(distribution).forEach(key => {
    distribution[key as PropertyType] = distribution[key as PropertyType] / total;
  });

  return distribution;
}

function calculatePropertyCorrelations(properties: InvestmentAnalysis[]) {
  const propertyIds = properties.map(p => p.id);
  const values = properties.map(() => new Array(properties.length).fill(0));
  
  // Simplified correlation calculation
  for (let i = 0; i < properties.length; i++) {
    for (let j = 0; j < properties.length; j++) {
      if (i === j) {
        values[i][j] = 1;
      } else {
        values[i][j] = calculatePairwiseCorrelation(properties[i], properties[j]);
      }
    }
  }

  return { propertyIds, values };
}

// Utility Functions
function calculateIRR(noi: number, purchasePrice: number): number {
  return (noi / purchasePrice) * 100 * 1.1;
}

function calculateCashOnCash(noi: number, debtService: number, purchasePrice: number): number {
  const equity = purchasePrice * 0.25;
  return ((noi - debtService) / equity) * 100;
}

function calculateLTV(purchasePrice: number): number {
  return 75;
}

function calculateBreakEven(operatingExpenses: number, totalRevenue: number): number {
  return (operatingExpenses / totalRevenue) * 100;
}

function calculateDebtService(purchasePrice: number): number {
  const loanAmount = purchasePrice * 0.75;
  const annualRate = 0.05;
  const termYears = 30;
  const monthlyRate = annualRate / 12;
  const numberOfPayments = termYears * 12;
  
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1) * 12;
}

function calculateOperatingExpenses(squareFeet: number): number {
  return squareFeet * 10;
}

function calculateTotalRevenue(squareFeet: number, occupancyRate: number): number {
  return squareFeet * 25 * (occupancyRate / 100);
}

function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function determineRiskProfile(metrics: FinancialMetrics | null, riskScore: number): RiskProfile {
  if (riskScore > 0.66) return RiskProfile.Opportunistic;
  if (riskScore > 0.33) return RiskProfile.ValueAdd;
  return RiskProfile.Core;
}

function generateAssumptions(propertyType: PropertyType, marketData: RateEnvironment) {
  return {
    rentGrowth: 2,
    expenseGrowth: 3,
    vacancyRate: 5,
    capitalReserves: 2,
    holdingPeriod: 10,
    exitCapRate: 6
  };
}

function calculateVolatility(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateTrendSlope(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  return numerator / denominator;
}

function calculatePairwiseCorrelation(p1: InvestmentAnalysis, p2: InvestmentAnalysis): number {
  // Simplified correlation based on property characteristics
  let correlation = 0;
  
  // Same property type increases correlation
  if (p1.propertyType === p2.propertyType) correlation += 0.3;
  
  // Similar cap rates increase correlation
  const capRateDiff = Math.abs(p1.metrics.capRate - p2.metrics.capRate);
  correlation += Math.max(0, 0.3 * (1 - capRateDiff / 5));
  
  // Similar occupancy rates increase correlation
  const occDiff = Math.abs(p1.occupancyRate - p2.occupancyRate);
  correlation += Math.max(0, 0.2 * (1 - occDiff / 50));
  
  return Math.min(1, Math.max(-1, correlation));
}

function generateRiskRecommendations(
  marketRisk: any,
  tenantRisk: any,
  locationRisk: any,
  propertyConditionRisk: any
): string[] {
  const recommendations: string[] = [];
  
  if (marketRisk.score > 0.6) {
    recommendations.push('Consider market hedging strategies');
  }
  
  if (tenantRisk.score > 0.6) {
    recommendations.push('Implement stronger tenant screening');
  }
  
  if (locationRisk.score > 0.6) {
    recommendations.push('Evaluate potential infrastructure improvements');
  }
  
  if (propertyConditionRisk.score > 0.6) {
    recommendations.push('Develop capital improvement plan');
  }
  
  return recommendations;
}

function calculateOverallRiskScore(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Re-export types
export * from './types';
