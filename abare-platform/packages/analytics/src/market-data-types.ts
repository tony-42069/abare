// Temporary declaration of market-data types to fix build issues

export interface MarketSpread {
  date: Date;
  propertyType: string;
  loanType: string;
  spread: number;
  baseRate: 'SOFR' | 'Treasury';
  term: string;
}

export interface MarketRisk {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  score: number;
  confidence: number;
}

export interface RateEnvironment {
  sofrRates: any[];
  treasuryRates: any[];
  marketSpreads: MarketSpread[];
  riskAssessment: MarketRisk;
}

export interface HistoricalData<T> {
  data: T[];
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
}

// Placeholder functions
export function assessMarketRisk(data: any): MarketRisk {
  return {
    riskLevel: 'medium',
    factors: ['placeholder'],
    score: 75,
    confidence: 0.8
  };
}

export function analyzeSpread(data: any): any {
  return {
    currentSpread: {} as MarketSpread,
    historicalAverage: 0,
    trend: { trend: 'stable', volatility: 0, confidence: 0, timeframe: '' },
    comparables: []
  };
}