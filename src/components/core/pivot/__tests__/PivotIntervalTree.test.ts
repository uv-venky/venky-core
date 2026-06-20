import { describe, expect, test } from 'vitest';
import { PivotIntervalTree } from '@/components/core/pivot/PivotIntervalTree';

describe('DemandHubPivotIntervalTree', () => {
  test('removeRange', () => {
    const tree = new PivotIntervalTree(100);
    tree.removeRange(0, 4);
    tree.removeRange(10, 19);
    tree.removeRange(50, 59);
    expect(tree.totalVisible()).toEqual(75);
    expect(tree.actualIndex(0)).toEqual(5);
    expect(tree.actualIndex(74)).toEqual(99);
    expect(tree.actualIndex(10)).toEqual(25);
    expect(tree.getAllVisibleRanges()).toEqual([
      [5, 9],
      [20, 49],
      [60, 99],
    ]);
  });

  test('addRange', () => {
    const tree = new PivotIntervalTree(100);
    tree.removeRange(10, 19);
    tree.removeRange(50, 59);
    expect(tree.totalVisible()).toEqual(80);
    tree.addRange(10, 19);
    tree.addRange(50, 59);
    expect(tree.totalVisible()).toEqual(100);
  });

  test('showAll', () => {
    const tree = new PivotIntervalTree(100);
    tree.removeRange(10, 19);
    tree.removeRange(50, 59);
    expect(tree.totalVisible()).toEqual(80);
    tree.showAll();
    expect(tree.totalVisible()).toEqual(100);
  });
});
