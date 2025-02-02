import { z } from 'zod';

// Base types
export interface BaseRate {
  date: Date;
  rate: number;
}

// Treasury Rate types
export interface TreasuryRate extends BaseRate {
  term: number; // years
}

export const treasuryRateSchema = z.object({
  date: z.date(),
  rate: z.number(),
  term: z.number().int().positive()
});

export function isTreasuryRate(data: any): data is TreasuryRate {
  return treasuryRateSchema.safeParse(data).success;
}

// SOFR Rate types
export interface SofrRate extends BaseRate {
  term: string; // e.g., '30D', '90D', '180D'
}

export const sofrRateSchema = z.object({
  date: z.date(),
  rate: z.number(),
  term: z.string()
});

export function isSofrRate(data: any): data is SofrRate {
  return sofrRateSchema.safeParse(data).success;
}

// Market Spread types
export interface MarketSpread {
  date: Date;
  propertyType: string;
  loanType: string;
  spread: number; // basis points
  baseRate: string; // 'SOFR' or 'Treasury'
  term: string;
}

export const marketSpreadSchema = z.object({
  date: z.date(),
  propertyType: z.string(),
  loanType: z.string(),
  spread: z.number(),
  baseRate: z.enum(['SOFR', 'Treasury']),
  term: z.string()
});

export function isMarketSpread(data: any): data is MarketSpread {
  return marketSpreadSchema.safeParse(data).success;
}

// Cap Rate types
export interface CapRate {
  date: Date;
  propertyType: string;
  market: string;
  rate: number;
}

export const capRateSchema = z.object({
  date: z.date(),
  propertyType: z.string(),
  market: z.string(),
  rate: z.number()
});

export function isCapRate(data: any): data is CapRate {
  return capRateSchema.safeParse(data).success;
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
