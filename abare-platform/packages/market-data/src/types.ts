// Base types
export interface BaseRate {
  date: Date;
  rate: number;
}

// Treasury Rate types
export interface TreasuryRate extends BaseRate {
  term: number; // years
}

export function isTreasuryRate(data: any): data is TreasuryRate {
  return (
    data &&
    typeof data === 'object' &&
    data.date instanceof Date &&
    typeof data.rate === 'number' &&
    typeof data.term === 'number' &&
    Number.isInteger(data.term) &&
    data.term > 0
  );
}

// SOFR Rate types
export interface SofrRate extends BaseRate {
  term: string; // e.g., '30D', '90D', '180D'
}

export function isSofrRate(data: any): data is SofrRate {
  return (
    data &&
    typeof data === 'object' &&
    data.date instanceof Date &&
    typeof data.rate === 'number' &&
    typeof data.term === 'string'
  );
}

// Market Spread types
export interface MarketSpread {
  date: Date;
  propertyType: string;
  loanType: string;
  spread: number; // basis points
  baseRate: 'SOFR' | 'Treasury';
  term: string;
}

export function isMarketSpread(data: any): data is MarketSpread {
  return (
    data &&
    typeof data === 'object' &&
    data.date instanceof Date &&
    typeof data.propertyType === 'string' &&
    typeof data.loanType === 'string' &&
    typeof data.spread === 'number' &&
    (data.baseRate === 'SOFR' || data.baseRate === 'Treasury') &&
    typeof data.term === 'string'
  );
}

// Cap Rate types
export interface CapRate {
  date: Date;
  propertyType: string;
  market: string;
  rate: number;
}

export function isCapRate(data: any): data is CapRate {
  return (
    data &&
    typeof data === 'object' &&
    data.date instanceof Date &&
    typeof data.propertyType === 'string' &&
    typeof data.market === 'string' &&
    typeof data.rate === 'number'
  );
}

// Historical Data types
export interface HistoricalData<T> {
  data: T[];
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
}

// Market Analysis types
export interface MarketTrend {
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  confidence: number;
  timeframe: string;
}

export interface SpreadAnalysis {
  currentSpread: MarketSpread;
  historicalAverage: number;
  trend: MarketTrend;
  comparables: MarketSpread[];
}

// Risk Assessment types
export interface MarketRisk {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  score: number;
  confidence: number;
}

export interface RateEnvironment {
  sofrRates: SofrRate[];
  treasuryRates: TreasuryRate[];
  marketSpreads: MarketSpread[];
  riskAssessment: MarketRisk;
}