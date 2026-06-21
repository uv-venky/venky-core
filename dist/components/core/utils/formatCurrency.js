import { isEmpty } from '../../../lib/core/common/isEmpty';
import { maskDigits } from '../../../components/core/utils/demoMask';
export function formatCurrency(value, fractionDigits = 2) {
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
export function formatNumber(value, fractionDigits = 0) {
    if (isEmpty(value)) {
        return '';
    }
    const formatted = Intl.NumberFormat('en-US', {
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits,
    }).format(value);
    return maskDigits(formatted);
}
export function formatCompactUSD(value) {
    const formatted = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(value);
    return maskDigits(formatted);
}
//# sourceMappingURL=formatCurrency.js.map