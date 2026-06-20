import { isEmpty } from '@/lib/core/common/isEmpty';
import { maskDigits } from '@/components/core/utils/demoMask';

export function formatCurrency(value?: number | null, fractionDigits = 2): string {
  if (isEmpty(value)) {
    return '';
  }
  const formatted = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
  return maskDigits(formatted);
}

export function formatNumber(value?: number | null, fractionDigits = 0): string {
  if (isEmpty(value)) {
    return '';
  }
  const formatted = Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
  return maskDigits(formatted);
}

export function formatCompactUSD(value: number): string {
  const formatted = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
  }).format(value);
  return maskDigits(formatted);
}
