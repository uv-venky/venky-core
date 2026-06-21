/* Copyright (c) 2024-present Venky Corp. */
import { format, parseISO } from 'date-fns';
let enabled = false;
// Constant masked values for visual regression (stable screenshots)
const VR_STRING = 'XXXXXXX';
const VR_NUMBER = '00000';
const VR_CURRENCY = '$0,000.00';
const VR_DATE = '00/00/0000';
const VR_DATETIME = '00/00/0000 00:00 XX';
const VR_CHART_DATE = 'Xxx 00';
const VR_CHART_NUMBER = '0,000';
export function setDemoMask(value) {
  enabled = value;
}
/**
 * Check if demo mask mode is enabled (variable length masking for demos).
 */
export function isDemoMask() {
  if (isVisualRegressionMode()) {
    return true; // VR mode implies demo mask is also active
  }
  return enabled;
}
/**
 * Check if visual regression mode is enabled (constant length masking for stable screenshots).
 */
export function isVisualRegressionMode() {
  return typeof window !== 'undefined' && window.__VENKY_DEMO_MASK__ === true;
}
/**
 * Mask digits in a string.
 * - Demo mode: Variable length (preserves original length)
 * - VR mode: Constant length for stable screenshots
 * @example maskDigits('12345') => '00000' (demo) or '00000' (VR)
 */
export function maskDigits(value) {
  if (value == null || !isDemoMask()) {
    return value;
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    return value.startsWith('$') ? VR_CURRENCY : VR_NUMBER;
  }
  // Demo mode: variable length (preserve original)
  return String(value).replace(/\d/g, '0');
}
/**
 * Mask a string.
 * - Demo mode: Variable length (preserves original length)
 * - VR mode: Constant length for stable screenshots
 * @example maskString('John Smith') => 'XXXX XXXXX' (demo) or 'XXXXXXX' (VR)
 */
export function maskString(value) {
  if (value == null || !isDemoMask()) {
    return value;
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    return VR_STRING;
  }
  // Demo mode: variable length (preserve original)
  return String(value).replace(/[A-Za-z0-9]/g, (c) => (/\d/.test(c) ? '0' : 'X'));
}
/**
 * Mask a number value.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant length for stable screenshots
 * @example maskValue(12345) => '00,000' (demo) or '0,000' (VR)
 */
export function maskValue(value) {
  if (value == null || !isDemoMask()) {
    return value;
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    return VR_CHART_NUMBER;
  }
  // Demo mode: variable length (preserve original)
  return value.toLocaleString().replace(/\d/g, '0');
}
/**
 * Mask formatted date strings.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant length for stable screenshots
 * @example maskDate('01/15/2024') => '00/00/0000' (both modes)
 */
export function maskDate(formattedDate) {
  if (formattedDate == null || !isDemoMask()) {
    return formattedDate;
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    // Check if it includes time
    if (formattedDate.includes('AM') || formattedDate.includes('PM') || formattedDate.includes(':')) {
      return VR_DATETIME;
    }
    return VR_DATE;
  }
  // Demo mode: variable length (preserve original format with zeros)
  return formattedDate.replace(/\d/g, '0');
}
/**
 * Format and mask a date for chart axis labels.
 * Use this instead of returning '' in chart tickFormatters.
 * - Demo mode: Formatted then masked (variable length)
 * - VR mode: Constant value for stable screenshots
 * @example maskChartDate('2024-01-15', 'MMM d') => 'Xxx 00' (VR) or 'Xxx 00' (demo)
 */
export function maskChartDate(value, formatStr = 'MMM d') {
  if (!isDemoMask()) {
    return format(parseISO(value), formatStr);
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    return VR_CHART_DATE;
  }
  // Demo mode: format then mask
  const formatted = format(parseISO(value), formatStr);
  return formatted.replace(/\d/g, '0').replace(/[A-Za-z]/g, 'X');
}
/**
 * Mask a number for chart labels.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant value for stable screenshots
 * @example maskChartNumber(1234) => '0,000' (VR) or '0,000' (demo)
 */
export function maskChartNumber(value) {
  if (!isDemoMask()) {
    return value.toLocaleString();
  }
  // VR mode: constant length
  if (isVisualRegressionMode()) {
    return VR_CHART_NUMBER;
  }
  // Demo mode: variable length (preserve original)
  return value.toLocaleString().replace(/\d/g, '0');
}
//# sourceMappingURL=demoMask.js.map
