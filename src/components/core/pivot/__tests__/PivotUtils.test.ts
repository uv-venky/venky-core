import { describe, expect, test } from 'vitest';
import { aggregators } from '@/components/core/pivot/PivotUtils';

type TItem = { x: number };
type TColumnKey = keyof TItem;

const getNumberValue = (item: Readonly<TItem>, key: TColumnKey) => Number(item[key]);
const getTextValue = (item: Readonly<TItem>, key: TColumnKey) => String(item[key]);

describe('aggregators', () => {
  test('Sum', () => {
    const agr = aggregators.Sum({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1.1 });
    agr.push({ x: 2.1 });
    agr.push({ x: 3.1 });
    const sum = agr.format(agr.values()[0]);
    expect(sum).toBe('6.30');
  });

  test('Count', () => {
    const agr = aggregators.Count({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1 });
    agr.push({ x: 2 });
    agr.push({ x: 3 });
    const count = agr.values()[0];
    expect(count).toBe(3);
  });

  test('Avg', () => {
    const agr = aggregators.Average({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1 });
    agr.push({ x: 2 });
    agr.push({ x: 3 });
    const sum = agr.values()[0];
    expect(sum).toBe(2);
  });

  test('Minimum', () => {
    const agr = aggregators.Minimum({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1 });
    agr.push({ x: 2 });
    agr.push({ x: 3 });
    const sum = agr.values()[0];
    expect(sum).toBe(1);
  });

  test('Maximum', () => {
    const agr = aggregators.Maximum({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1 });
    agr.push({ x: 2 });
    agr.push({ x: 3 });
    const sum = agr.values()[0];
    expect(sum).toBe(3);
  });

  test('Unique Count', () => {
    const agr = aggregators['Unique Count']({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1 });
    agr.push({ x: 1 });
    agr.push({ x: 3 });
    const sum = agr.values()[0];
    expect(sum).toBe(2);
  });

  test('Integer Sum', () => {
    const agr = aggregators['Integer Sum']({
      attrs: ['x'],
      getNumberValue,
      getTextValue,
    })();
    agr.push({ x: 1.1 });
    agr.push({ x: 2.1 });
    agr.push({ x: 3.1 });
    const sum = agr.format(agr.values()[0]);
    expect(sum).toBe('6');
  });
});
