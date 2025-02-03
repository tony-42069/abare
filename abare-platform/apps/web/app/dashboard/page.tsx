"use client";

import { CreditRiskDashboard } from "@abare/ui";
import { Container, Title } from "@mantine/core";

// Sample data for initial development
const SAMPLE_DATA = {
  analysis: {
    id: 'demo-1',
    propertyId: 'prop-1',
    overallRiskLevel: 'moderate',
    tenantRisks: [
      {
        id: 'risk-1',
        tenantId: 'tenant-1',
        leaseTermRemaining: 48,
        monthlyRent: 50000,
        rentPerSqFt: 35,
        escalations: 0.03,
        securityDeposit: 150000,
        defaultProbability: 0.05,
        marketRentDelta: 5,
        creditRiskLevel: 'low'
      },
      {
        id: 'risk-2',
        tenantId: 'tenant-2',
        leaseTermRemaining: 24,
        monthlyRent: 30000,
        rentPerSqFt: 30,
        escalations: 0.02,
        securityDeposit: 60000,
        defaultProbability: 0.15,
        marketRentDelta: -2,
        creditRiskLevel: 'high'
      }
    ],
    concentrationRisk: [
      {
        tenantId: 'tenant-1',
        squareFootage: 17000,
        percentOfTotal: 42.5,
        annualRent: 600000,
        percentOfRevenue: 41.7,
        industryExposure: 35
      },
      {
        tenantId: 'tenant-2',
        squareFootage: 12000,
        percentOfTotal: 30,
        annualRent: 360000,
        percentOfRevenue: 25,
        industryExposure: 25
      }
    ],
    weightedAverageLeaseLength: 38,
    totalDefaultRisk: 0.09,
    marketVolatility: 0.12,
    portfolioImpact: {
      diversificationBenefit: 0.08,
      concentrationPenalty: 0.05,
      netRiskAdjustment: 0.03
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  tenants: [
    {
      id: 'tenant-1',
      name: 'Tech Solutions Inc',
      industry: 'technology',
      creditScore: 750,
      annualRevenue: 50000000,
      yearsInBusiness: 12,
      publicCompany: true,
      employeeCount: 250
    },
    {
      id: 'tenant-2',
      name: 'Retail Dynamics',
      industry: 'retail',
      creditScore: 620,
      annualRevenue: 15000000,
      yearsInBusiness: 5,
      publicCompany: false,
      employeeCount: 75
    }
  ]
};

export default function DashboardPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">ABARE Platform</Title>
      <CreditRiskDashboard
        analysis={SAMPLE_DATA.analysis}
        tenants={SAMPLE_DATA.tenants}
        onTenantSelect={(tenantId) => console.log('Selected tenant:', tenantId)}
      />
    </Container>
  );
}
