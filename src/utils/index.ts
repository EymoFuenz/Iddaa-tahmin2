/**
 * Utility Functions
 */

import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Format match date for display
 */
export function formatMatchDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Bugün, ' + format(date, 'HH:mm');
    }
    
    if (isTomorrow(date)) {
      return 'Yarın, ' + format(date, 'HH:mm');
    }

    return format(date, 'd MMM yyyy, HH:mm', { locale: tr });
  } catch {
    return dateString;
  }
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { locale: tr, addSuffix: true });
  } catch {
    return dateString;
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'scheduled' | 'live' | 'finished'): string {
  switch (status) {
    case 'live':
      return 'bg-destructive/15 text-destructive';
    case 'finished':
      return 'bg-muted text-muted-foreground';
    case 'scheduled':
      return 'bg-primary/15 text-primary';
  }
}

/** For Badge component variant prop */
export function getStatusVariant(status: 'scheduled' | 'live' | 'finished'): 'info' | 'danger' | 'warning' {
  switch (status) {
    case 'live': return 'danger';
    case 'finished': return 'info';
    case 'scheduled': return 'info';
  }
}

/**
 * Get status label in Turkish
 */
export function getStatusLabel(status: 'scheduled' | 'live' | 'finished'): string {
  switch (status) {
    case 'live':
      return 'Canlı';
    case 'finished':
      return 'Bitti';
    case 'scheduled':
      return 'Yaklaşan';
  }
}

/**
 * Get result badge color
 */
export function getResultColor(result: string): string {
  if (result === 'W' || result === 'Win') return 'bg-green-500 bg-opacity-20 text-green-400';
  if (result === 'D' || result === 'Draw') return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
  return 'bg-red-500 bg-opacity-20 text-red-400';
}

/**
 * Format form string for display
 */
export function formatForm(form: string): string[] {
  return form.split('').map(char => {
    return char.toUpperCase();
  });
}

/**
 * Get form color
 */
export function getFormColor(char: string): string {
  switch (char.toUpperCase()) {
    case 'W':
      return 'bg-green-600 text-white';
    case 'D':
      return 'bg-yellow-600 text-white';
    case 'L':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

/**
 * Calculate difference
 */
export function calculateDifference(value1: number, value2: number): { diff: number; percentage: number } {
  const diff = value1 - value2;
  const percentage = value2 !== 0 ? (diff / value2) * 100 : 0;

  return { diff, percentage };
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Round to decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get confidence color
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return 'text-green-400';
  if (confidence >= 55) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get momentum color and emoji
 */
export function getMomentumIndicator(momentum: number): { color: string; emoji: string; text: string } {
  if (momentum > 20) {
    return { color: 'text-green-400', emoji: '📈', text: 'Yükselen' };
  }
  if (momentum > 5) {
    return { color: 'text-green-300', emoji: '↗️', text: 'İyi' };
  }
  if (momentum > -5) {
    return { color: 'text-gray-300', emoji: '→', text: 'Sabit' };
  }
  if (momentum > -20) {
    return { color: 'text-red-300', emoji: '↘️', text: 'Kötü' };
  }
  return { color: 'text-red-500', emoji: '📉', text: 'Düşen' };
}
