import { format } from 'date-fns';
import {
  TreasuryRate,
  SofrRate,
  MarketSpread,
  CapRate,
  MarketTrend,
  SpreadAnalysis,
  MarketRisk,
  RateEnvironment,
  HistoricalData,
  isTreasuryRate,
  isSofrRate,
  isMarketSpread,
  isCapRate
} from './types';

// Rate Processing Functions
export function processTreasuryRate(data: TreasuryRate): string {
  if (!isTreasuryRate(data)) {
    throw new Error('Invalid treasury rate data');
  }
  return `${format(data.date, 'yyyy-MM-dd')} - ${data.term}yr: ${data.rate}%`;
}

export function processSofrRate(data: SofrRate): string {
  if (!isSofrRate(data)) {
    throw new Error('Invalid SOFR rate data');
  }
  return `${format(data.date, 'yyyy-MM-dd')} - ${data.term}: ${data.rate}%`;
}

export function processMarketSpread(data: MarketSpread): string {
  if (!isMarketSpread(data)) {
    throw new Error('Invalid market spread data');
  }
  return `${format(data.date, 'yyyy-MM-dd')} - ${data.propertyType} (${data.loanType}): ${data.spread}bps over ${data.baseRate} ${data.term}`;
}

export function processCapRate(data: CapRate): string {
  if (!isCapRate(data)) {
    throw new Error('Invalid cap rate data');
  }
  return `${format(data.date, 'yyyy-MM-dd')} - ${data.propertyType} in ${data.market}: ${data.rate}%`;
}

// Market Analysis Functions
export function analyzeMarketTrend(historicalData: HistoricalData<MarketSpread>): MarketTrend {
  const spreads = historicalData.data.map(d => d.spread);
  const volatility = calculateVolatility(spreads);
  const trend = determineTrend(spreads);
  
  return {
    trend,
    volatility,
    confidence: calculateConfidence(volatility, spreads.length),
    timeframe: `${format(historicalData.startDate, 'yyyy-MM-dd')} to ${format(historicalData.endDate, 'yyyy-MM-dd')}`
  };
}

export function analyzeSpread(
  currentSpread: MarketSpread,
  historicalData: HistoricalData<MarketSpread>
): SpreadAnalysis {
  const historicalAverage = calculateAverage(historicalData.data.map(d => d.spread));
  const trend = analyzeMarketTrend(historicalData);
  const comparables = findComparables(currentSpread, historicalData.data);

  return {
    currentSpread,
    historicalAverage,
    trend,
    comparables
  };
}

export function assessMarketRisk(environment: RateEnvironment): MarketRisk {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Analyze SOFR volatility
  const sofrVolatility = calculateVolatility(environment.sofrRates.map(r => r.rate));
  if (sofrVolatility > 0.25) {
    riskFactors.push('High SOFR rate volatility');
    riskScore += 0.33;
  }

  // Analyze spread trends
  const spreadTrend = analyzeMarketTrend({
    data: environment.marketSpreads,
    startDate: new Date(Math.min(...environment.marketSpreads.map(s => s.date.getTime()))),
    endDate: new Date(Math.max(...environment.marketSpreads.map(s => s.date.getTime()))),
    frequency: 'daily'
  });
  
  if (spreadTrend.trend === 'increasing' && spreadTrend.volatility > 0.2) {
    riskFactors.push('Increasing spreads with high volatility');
    riskScore += 0.33;
  }

  // Analyze rate environment
  const latestSofr = environment.sofrRates[environment.sofrRates.length - 1].rate;
  if (latestSofr > 5) {
    riskFactors.push('High base rate environment');
    riskScore += 0.34;
  }

  return {
    riskLevel: determineRiskLevel(riskScore),
    factors: riskFactors,
    score: riskScore,
    confidence: calculateConfidence(spreadTrend.volatility, environment.marketSpreads.length)
  };
}

// Helper Functions
function calculateVolatility(values: number[]): number {
  const avg = calculateAverage(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(calculateAverage(squaredDiffs));
}

function calculateAverage(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateConfidence(volatility: number, sampleSize: number): number {
  // Simple confidence calculation based on volatility and sample size
  const volatilityFactor = Math.max(0, 1 - volatility);
  const sizeFactor = Math.min(1, sampleSize / 100);
  return volatilityFactor * sizeFactor;
}

function determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);
  
  const difference = secondAvg - firstAvg;
  const threshold = 0.1; // 10% change threshold
  
  if (difference > threshold) return 'increasing';
  if (difference < -threshold) return 'decreasing';
  return 'stable';
}

function determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 0.33) return 'low';
  if (score < 0.66) return 'medium';
  return 'high';
}

function findComparables(current: MarketSpread, historical: MarketSpread[]): MarketSpread[] {
  return historical
    .filter(spread => 
      spread.propertyType === current.propertyType &&
      spread.loanType === current.loanType &&
      spread.baseRate === current.baseRate &&
      spread.term === current.term
    )
    .sort((a, b) => Math.abs(a.spread - current.spread) - Math.abs(b.spread - current.spread))
    .slice(0, 5);
}

// Re-export types
export * from './types';
