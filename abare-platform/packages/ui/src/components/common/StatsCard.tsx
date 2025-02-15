import { Card, Text, Group, ThemeIcon, rem } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { MantineTheme } from '@mantine/core';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  description?: string;
  gradient?: [string, string];
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  trend,
  icon,
  description,
  gradient = ['#1971c2', '#228be6'],
  isLoading = false,
}: StatsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1000; // Animation duration in ms
      const steps = 60; // Number of steps in animation
      const stepValue = numericValue / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedValue(currentStep * stepValue);

        if (currentStep === steps) {
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [value, numericValue]);

  return (
    <Card
      p="xl"
      radius="md"
      style={{
        backgroundColor: 'var(--mantine-color-white)',
        backdropFilter: 'blur(8px)',
        background: `linear-gradient(135deg, ${gradient[0]}15, ${gradient[1]}15)`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid var(--mantine-color-gray-2)',
        position: isLoading ? 'relative' : undefined,
        overflow: isLoading ? 'hidden' : undefined,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--mantine-shadow-md)',
        },
        ...(isLoading && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(90deg, ${gradient[0]}00, ${gradient[0]}20, ${gradient[0]}00)`,
            backgroundSize: '468px 100%',
            animation: 'shimmer 1.5s infinite linear',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-468px 0' },
              '100%': { backgroundPosition: '468px 0' },
            },
          },
        }),
      }}
    >
      <Group justify="space-between" mb={rem(5)}>
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        {icon && (
          <ThemeIcon
            variant="light"
            style={{
              background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            }}
          >
            {icon}
          </ThemeIcon>
        )}
      </Group>

      <Group align="flex-end" gap="xs">
        <Text fw={700} size="xl">
          {typeof value === 'number' ? animatedValue.toFixed(0) : value}
        </Text>
        {trend !== undefined && (
          <Group gap={4}>
            {trend > 0 ? (
              <IconTrendingUp size={16} color="green" />
            ) : (
              <IconTrendingDown size={16} color="red" />
            )}
            <Text
              c={trend > 0 ? 'green' : 'red'}
              size="sm"
              fw={500}
            >
              {Math.abs(trend)}%
            </Text>
          </Group>
        )}
      </Group>

      {description && (
        <Text size="xs" c="dimmed" mt={4}>
          {description}
        </Text>
      )}
    </Card>
  );
}
