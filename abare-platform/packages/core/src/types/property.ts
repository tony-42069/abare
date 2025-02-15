export enum PropertyType {
  Office = 'office',
  Retail = 'retail',
  Industrial = 'industrial',
  Multifamily = 'multifamily',
  MixedUse = 'mixed-use',
  Other = 'other'
}

export enum RiskProfileType {
  Core = 'core',
  ValueAdd = 'value-add',
  Opportunistic = 'opportunistic'
}

export interface RiskProfile {
  type: RiskProfileType;
  level: RiskLevel;
  score: number;
  factors: Array<{
    category: string;
    impact: number;
    description: string;
  }>;
  lastUpdated: string;
}

export enum RiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Severe = 'severe'
}

export interface PropertyMetadata {
  tenants: string[];
  amenities: string[];
  parking_spaces: number;
  market_id: string;
  risk_profile: RiskProfile;
}

// Re-export Property interface
export type { Property } from '../api/services/PropertyService';
