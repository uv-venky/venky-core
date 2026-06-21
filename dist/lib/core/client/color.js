import { hashCode } from '../../../lib/core/common/hash';
const PALETTE = [
    '#5a7896',
    '#ff93af',
    '#ff4ba6',
    '#ff78ff',
    '#9f46e4',
    '#6457f9',
    '#0064fb',
    '#48dafd',
    '#00d4c8',
    '#19db7e',
    '#ace60f',
    '#ffd100',
    '#ffa800',
    '#ff7511',
    '#fb5779',
];
export const getColor = (value, palette = PALETTE) => palette[hashCode(value) % palette.length];
//# sourceMappingURL=color.js.map