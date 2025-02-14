"use client";

import { CreditRiskDashboard } from "@abare/ui";
import { Container, Title, LoadingOverlay, Alert } from "@mantine/core";
import { AnalysisService, createApiClient } from "@abare/core";
import { useEffect, useState } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

export enum CreditRiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Severe = 'severe'
}

interface TenantRisk {
  id: string;
  tenantId: string;
  leaseTermRemaining: number;
  monthlyRent: number;
  rentPerSqFt: number;
  escalations: number;
  securityDeposit: number;
  defaultProbability: number;
  marketRentDelta: number;
  creditRiskLevel: CreditRiskLevel;
}

interface ConcentrationRisk {
  tenantId: string;
  squareFootage: number;
  percentOfTotal: number;
  annualRent: number;
  percentOfRevenue: number;
  industryExposure: number;
}

interface Tenant {
  id: string;
  name: string;
  industry: string;
  creditScore: number;
  annualRevenue: number;
  yearsInBusiness: number;
  publicCompany: boolean;
  employeeCount: number;
}

interface DashboardData {
  analysis: {
    id: string;
    propertyId: string;
    overallRiskLevel: CreditRiskLevel;
    tenantRisks: TenantRisk[];
    concentrationRisk: ConcentrationRisk[];
    weightedAverageLeaseLength: number;
    totalDefaultRisk: number;
    marketVolatility: number;
    portfolioImpact: {
      diversificationBenefit: number;
      concentrationPenalty: number;
      netRiskAdjustment: number;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  tenants: Tenant[];
};

// Transform API response to dashboard format
const transformAnalysisData = (apiAnalysis: any) => {
  const { results, metadata } = apiAnalysis;
  
  return {
    analysis: {
      id: apiAnalysis.id,
      propertyId: apiAnalysis.property_id,
      overallRiskLevel: results.risk_factors.find((f: any) => f.category === 'overall')?.level || 'moderate',
      tenantRisks: results.insights.tenant_risks || [],
      concentrationRisk: results.insights.concentration_risks || [],
      weightedAverageLeaseLength: results.metrics.weighted_avg_lease_length,
      totalDefaultRisk: results.metrics.total_default_risk,
      marketVolatility: results.metrics.market_volatility,
      portfolioImpact: results.insights.portfolio_impact,
      createdAt: new Date(apiAnalysis.created_at),
      updatedAt: new Date(apiAnalysis.updated_at)
    },
    tenants: metadata.tenants || []
  };
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const client = createApiClient();
        const analysisService = new AnalysisService(client);
        const response = await analysisService.listAnalyses(1, 1, undefined, 'credit_risk', 'completed');
        
        if (!response.items || response.items.length === 0) {
          setError('No completed credit risk analysis found');
          return;
        }

        const analysis = await analysisService.getAnalysis(response.items[0].id);
        const transformedData = transformAnalysisData(analysis.data);
        setDashboardData(transformedData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  const handleTenantSelect = async (tenantId: string) => {
    try {
      // Implement tenant selection logic here
      console.log('Selected tenant:', tenantId);
    } catch (err) {
      console.error('Tenant selection error:', err);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">ABARE Platform</Title>
      
      {loading && <LoadingOverlay visible={true} />}
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="xl">
          {error}
        </Alert>
      )}
      
      {dashboardData && (
        <CreditRiskDashboard
          analysis={dashboardData.analysis}
          tenants={dashboardData.tenants}
          onTenantSelect={handleTenantSelect}
        />
      )}
    </Container>
  );
}
