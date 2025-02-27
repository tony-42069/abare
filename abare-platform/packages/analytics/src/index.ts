import {
  FinancialMetrics,
  InvestmentAnalysis,
  RiskAnalysis,
  PortfolioAnalysis,
  CreditRiskFactors,
  CreditRiskWeights,
  CreditRiskCalculation,
  TenantRiskProfile,
  PropertyCreditAnalysis,
  isFinancialMetrics,
  isInvestmentAnalysis,
  isRiskAnalysis,
  isPortfolioAnalysis,
  isCreditRiskFactors,
  isCreditRiskWeights,
  isCreditRiskCalculation,
  isTenantRiskProfile,
  isPropertyCreditAnalysis
} from './types';
import { 
  PropertyType, 
  RiskProfile,
  CreditRiskLevel,
  TenantProfile,
  LeaseRisk,
  TenantConcentration,
  CreditRiskAnalysis,
  IndustryType
} from './core-types';
import {
  MarketSpread,
  RateEnvironment,
  assessMarketRisk,
  analyzeSpread,
  HistoricalData
} from './market-data-types';

// Credit Risk Analysis Functions
import {
  calculateTenantRiskProfile,
  calculatePropertyCreditAnalysis
} from './credit-risk';

export {
  calculateTenantRiskProfile,
  calculatePropertyCreditAnalysis
};

// Financial Analysis Functions
export function calculateFinancialMetrics(
  propertyValue: number,
  noi: number,
  debtService: number,
  operatingExpenses: number,
  loanAmount: number,
  breakEvenOccupancy: number
): FinancialMetrics {
  // Calculate key financial metrics
  const capRate = (noi / propertyValue) * 100;
  const irr = 8.5; // Simplified - would need cash flow projections
  const cashOnCash = ((noi - debtService) / (propertyValue - loanAmount)) * 100;
  const debtServiceCoverage = noi / debtService;
  const loanToValue = (loanAmount / propertyValue) * 100;
  const operatingExpenseRatio = (operatingExpenses / noi) * 100;

  return {
    noi,
    capRate,
    irr,
    cashOnCash,
    debtServiceCoverage,
    loanToValue,
    operatingExpenseRatio,
    breakEvenOccupancy
  };
}

export function generateInvestmentAnalysis(
  propertyId: string,
  propertyType: PropertyType,
  riskProfile: RiskProfile,
  purchasePrice: number,
  squareFeet: number,
  occupancyRate: number,
  noi: number,
  debtService: number,
  operatingExpenses: number,
  loanAmount: number,
  breakEvenOccupancy: number,
  assumptions: {
    rentGrowth: number;
    expenseGrowth: number;
    vacancyRate: number;
    capitalReserves: number;
    holdingPeriod: number;
    exitCapRate: number;
  }
): InvestmentAnalysis {
  const metrics = calculateFinancialMetrics(
    purchasePrice,
    noi,
    debtService,
    operatingExpenses,
    loanAmount,
    breakEvenOccupancy
  );

  const baseIrr = metrics.irr;
  const bestIrr = baseIrr * 1.2;
  const worstIrr = baseIrr * 0.8;

  return {
    id: `inv-${Date.now()}`,
    propertyId,
    type: 'financial',
    propertyType,
    riskProfile,
    purchasePrice,
    squareFeet,
    occupancyRate,
    metrics,
    assumptions,
    sensitivity: {
      capRateRange: [metrics.capRate * 0.9, metrics.capRate * 1.1],
      noiRange: [noi * 0.9, noi * 1.1],
      irrScenarios: {
        best: bestIrr,
        base: baseIrr,
        worst: worstIrr
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1
  };
}

export function generateRiskAnalysis(
  propertyId: string,
  propertyType: PropertyType,
  riskProfile: RiskProfile,
  marketConditions: {
    economicGrowth: number;
    employmentTrends: number;
    supplyDemand: number;
    marketLiquidity: number;
  },
  tenantFactors: {
    creditQuality: number;
    tenantDiversity: number;
    leaseTerms: number;
    rolloverExposure: number;
  },
  locationFactors: {
    accessibility: number;
    demographics: number;
    submarket: number;
    amenities: number;
  },
  propertyCondition: {
    age: number;
    maintenance: number;
    functionality: number;
    sustainability: number;
  }
): RiskAnalysis {
  // Calculate risk scores (0-100, 100 being lowest risk)
  const calculateScore = (factors: Record<string, number>) => {
    const values = Object.values(factors);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const marketRiskScore = calculateScore(marketConditions);
  const tenantRiskScore = calculateScore(tenantFactors);
  const locationRiskScore = calculateScore(locationFactors);
  const propertyConditionRiskScore = calculateScore(propertyCondition);

  // Calculate overall risk (weighted average)
  const overallRisk = (
    marketRiskScore * 0.25 +
    tenantRiskScore * 0.35 +
    locationRiskScore * 0.2 +
    propertyConditionRiskScore * 0.2
  );

  // Generate recommendations based on risk analysis
  const recommendations: string[] = [];

  if (tenantRiskScore < 70) {
    recommendations.push('Consider tenant diversification strategy to reduce concentration risk');
  }

  if (marketRiskScore < 65) {
    recommendations.push('Monitor market conditions closely for adverse changes');
  }

  if (propertyConditionRiskScore < 60) {
    recommendations.push('Implement a capital improvement plan to address property condition issues');
  }

  if (locationRiskScore < 70) {
    recommendations.push('Evaluate location-based improvements to enhance property attractiveness');
  }

  return {
    id: `risk-${Date.now()}`,
    propertyId,
    type: 'risk',
    propertyType,
    riskProfile,
    marketRisk: {
      score: marketRiskScore,
      factors: marketConditions
    },
    tenantRisk: {
      score: tenantRiskScore,
      factors: tenantFactors
    },
    locationRisk: {
      score: locationRiskScore,
      factors: locationFactors
    },
    propertyConditionRisk: {
      score: propertyConditionRiskScore,
      factors: propertyCondition
    },
    overallRisk,
    recommendations,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1
  };
}

export function generatePortfolioAnalysis(
  properties: {
    id: string;
    type: PropertyType;
    value: number;
    capRate: number;
    occupancy: number;
    riskProfile: RiskProfile;
  }[]
): PortfolioAnalysis {
  // Calculate aggregate metrics
  const totalValue = properties.reduce((sum, p) => sum + p.value, 0);
  
  const weightedCapRate = properties.reduce((sum, p) => {
    const weight = p.value / totalValue;
    return sum + (p.capRate * weight);
  }, 0);
  
  const averageOccupancy = properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length;
  
  // Helper function to normalize values (0-1 scale)
  const normalize = (arr: number[]) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map(v => (v - min) / (max - min || 1)); // Avoid division by zero
  };
  
  // Calculate diversification score based on property types and risk profiles
  // The more evenly distributed, the higher the score
  const calculateDiversificationScore = () => {
    // Count properties by type
    const typeCount: Record<string, number> = {};
    properties.forEach(p => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    });
    
    // Calculate Shannon entropy (diversity measure)
    const typeEntropy = Object.values(typeCount).reduce((entropy, count) => {
      const p = count / properties.length;
      return entropy - (p * Math.log2(p));
    }, 0);
    
    // Normalize to 0-100 scale (max entropy depends on number of categories)
    const maxTypeEntropy = Math.log2(Object.keys(typeCount).length || 1);
    const typeScore = (typeEntropy / maxTypeEntropy) * 100;
    
    // Do the same for risk profiles
    const riskCount: Record<string, number> = {};
    properties.forEach(p => {
      riskCount[p.riskProfile] = (riskCount[p.riskProfile] || 0) + 1;
    });
    
    const riskEntropy = Object.values(riskCount).reduce((entropy, count) => {
      const p = count / properties.length;
      return entropy - (p * Math.log2(p));
    }, 0);
    
    const maxRiskEntropy = Math.log2(Object.keys(riskCount).length || 1);
    const riskScore = (riskEntropy / maxRiskEntropy) * 100;
    
    // Average the two scores
    return (typeScore + riskScore) / 2;
  };
  
  const diversificationScore = calculateDiversificationScore();
  
  // Calculate distribution by risk profile
  const riskDistribution: Record<string, number> = {
    core: 0,
    valueAdd: 0,
    opportunistic: 0
  };
  
  properties.forEach(p => {
    riskDistribution[p.riskProfile] += p.value / totalValue * 100;
  });
  
  // Calculate distribution by property type
  const propertyTypeDistribution: Record<string, number> = {
    office: 0,
    retail: 0,
    industrial: 0,
    multifamily: 0,
    mixed: 0,
    other: 0
  };
  
  properties.forEach(p => {
    propertyTypeDistribution[p.type] += p.value / totalValue * 100;
  });
  
  // Generate a simple correlation matrix
  // In a real implementation, this would use historical returns data
  // Here we're just creating a placeholder
  const propertyIds = properties.map(p => p.id);
  const n = propertyIds.length;
  const values: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    values[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        values[i][j] = 1; // Self-correlation is 1
      } else {
        // Dummy correlation based on property types
        const sameType = properties[i].type === properties[j].type;
        values[i][j] = sameType ? 0.7 : 0.3;
      }
    }
  }
  
  return {
    id: `port-${Date.now()}`,
    properties: propertyIds,
    aggregateMetrics: {
      totalValue,
      weightedCapRate,
      averageOccupancy,
      diversificationScore
    },
    riskDistribution: riskDistribution as any,
    propertyTypeDistribution: propertyTypeDistribution as any,
    correlationMatrix: {
      propertyIds,
      values
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed',
    version: 1,
    propertyId: 'portfolio', // Portfolio analysis doesn't have a single property
    type: 'market'
  };
}

// Enums Exports
export {
  PropertyType,
  RiskProfile,
  CreditRiskLevel,
  IndustryType
};

// Type Re-exports
export type {
  FinancialMetrics,
  InvestmentAnalysis,
  RiskAnalysis,
  PortfolioAnalysis,
  CreditRiskFactors,
  CreditRiskWeights,
  CreditRiskCalculation,
  TenantRiskProfile,
  PropertyCreditAnalysis,
  TenantProfile,
  LeaseRisk,
  TenantConcentration,
  CreditRiskAnalysis,
  MarketSpread,
  RateEnvironment,
  HistoricalData
};

// Type Guard Re-exports
export {
  isFinancialMetrics,
  isInvestmentAnalysis,
  isRiskAnalysis,
  isPortfolioAnalysis,
  isCreditRiskFactors,
  isCreditRiskWeights,
  isCreditRiskCalculation,
  isTenantRiskProfile,
  isPropertyCreditAnalysis,
  assessMarketRisk,
  analyzeSpread
};