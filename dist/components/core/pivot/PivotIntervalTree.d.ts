declare class IntervalNode {
    start: number;
    end: number;
    left: IntervalNode | null;
    right: IntervalNode | null;
    constructor(start: number, end: number);
    insert(start: number, end: number): void;
    remove(start: number, end: number): IntervalNode | null;
    total(): number;
    findMin(): IntervalNode;
    findMax(): IntervalNode;
    findWithStart(start: number): IntervalNode | null;
    findWithEnd(end: number): IntervalNode | null;
    findIndex(visibleIndex: number, offset?: number): number;
    populateVisibleRanges(ranges: Array<[number, number]>): void;
}
export declare class PivotIntervalTree {
    root: IntervalNode | null;
    total: number;
    constructor(total: number);
    reset(total: number): void;
    showAll(): void;
    addRange(start: number, end: number): void;
    removeRange(start: number, end: number): void;
    totalVisible(): number;
    actualIndex(visibleIndex: number): number;
    getAllVisibleRanges(): Array<[number, number]>;
}
export {};
//# sourceMappingURL=PivotIntervalTree.d.ts.map