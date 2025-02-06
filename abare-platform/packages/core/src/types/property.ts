export enum PropertyType {
  Office = 'office',
  Retail = 'retail',
  Industrial = 'industrial',
  Multifamily = 'multifamily',
  MixedUse = 'mixed-use',
  Other = 'other'
}

export enum RiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Severe = 'severe'
}

export interface RiskProfile {
  level: RiskLevel;
  score: number;
  factors: Array<{
    category: string;
    impact: number;
    description: string;
  }>;
  lastUpdated: string;
}

// Re-export Property interface
export type { Property } from '../api/services/PropertyService';
