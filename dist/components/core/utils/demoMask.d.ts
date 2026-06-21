declare global {
    interface Window {
        __VENKY_DEMO_MASK__?: boolean;
    }
}
export declare function setDemoMask(value: boolean): void;
/**
 * Check if demo mask mode is enabled (variable length masking for demos).
 */
export declare function isDemoMask(): boolean;
/**
 * Check if visual regression mode is enabled (constant length masking for stable screenshots).
 */
export declare function isVisualRegressionMode(): boolean;
/**
 * Mask digits in a string.
 * - Demo mode: Variable length (preserves original length)
 * - VR mode: Constant length for stable screenshots
 * @example maskDigits('12345') => '00000' (demo) or '00000' (VR)
 */
export declare function maskDigits(value: string): string;
/**
 * Mask a string.
 * - Demo mode: Variable length (preserves original length)
 * - VR mode: Constant length for stable screenshots
 * @example maskString('John Smith') => 'XXXX XXXXX' (demo) or 'XXXXXXX' (VR)
 */
export declare function maskString(value?: string): string | undefined;
/**
 * Mask a number value.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant length for stable screenshots
 * @example maskValue(12345) => '00,000' (demo) or '0,000' (VR)
 */
export declare function maskValue(value: number): string | number;
/**
 * Mask formatted date strings.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant length for stable screenshots
 * @example maskDate('01/15/2024') => '00/00/0000' (both modes)
 */
export declare function maskDate(formattedDate: string): string;
/**
 * Format and mask a date for chart axis labels.
 * Use this instead of returning '' in chart tickFormatters.
 * - Demo mode: Formatted then masked (variable length)
 * - VR mode: Constant value for stable screenshots
 * @example maskChartDate('2024-01-15', 'MMM d') => 'Xxx 00' (VR) or 'Xxx 00' (demo)
 */
export declare function maskChartDate(value: string, formatStr?: string): string;
/**
 * Mask a number for chart labels.
 * - Demo mode: Variable length (preserves original format)
 * - VR mode: Constant value for stable screenshots
 * @example maskChartNumber(1234) => '0,000' (VR) or '0,000' (demo)
 */
export declare function maskChartNumber(value: number): string;
//# sourceMappingURL=demoMask.d.ts.map