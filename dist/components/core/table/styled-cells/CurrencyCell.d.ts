import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface CurrencyCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the amount field */
    attributeCode: StringKeyof<T>;
    /** Attribute code for the currency field (e.g., 'budgetCurrency') */
    currencyField?: StringKeyof<T>;
    /** Static currency code (used if currencyField not provided) */
    currency?: string;
    /** Icon to display before value */
    icon?: ReactNode;
    /** Icon color class */
    iconClass?: string;
    /** Number of decimal places (default: 0) */
    fractionDigits?: number;
    /** Unit suffix (e.g., "/hr", "/mo") */
    unit?: string;
    /** Additional class names */
    className?: string;
    feedbackMask?: boolean;
}
/**
 * Currency cell with dynamic currency code from another field.
 *
 * @example
 * ```tsx
 * // Dynamic currency from row field
 * <CurrencyCell
 *   attributeCode="budgetAmount"
 *   currencyField="budgetCurrency"
 *   icon={<Banknote className="size-3.5" />}
 *   {...props}
 * />
 *
 * // Static currency
 * <CurrencyCell
 *   attributeCode="amount"
 *   currency="USD"
 *   {...props}
 * />
 *
 * // Hourly rate with unit suffix
 * <CurrencyCell
 *   attributeCode="hourlyRate"
 *   currencyField="currency"
 *   unit="/hr"
 *   icon={<Banknote className="size-3.5" />}
 *   {...props}
 * />
 * ```
 */
export declare function CurrencyCell<T extends object>({ attributeCode, currencyField, currency: staticCurrency, icon, iconClass, fractionDigits, unit, className, feedbackMask, row, }: CurrencyCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CurrencyCell.d.ts.map