/* Copyright (c) 2024-present VENKY Corp. */

/*
 * This class is used to store the visible intervals in PivotIntervalTree
 * Similar to a linked list, but with the ability to merge overlapping intervals
 */
class IntervalNode {
  start: number;
  end: number;
  left: IntervalNode | null = null;
  right: IntervalNode | null = null;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  // Insert a new interval into the tree.
  insert(start: number, end: number) {
    if (start > this.end + 1) {
      // Check if the new interval is strictly to the right
      if (this.right) {
        this.right.insert(start, end);
      } else {
        this.right = new IntervalNode(start, end);
      }
    } else if (end < this.start - 1) {
      // Check if the new interval is strictly to the left
      if (this.left) {
        this.left.insert(start, end);
      } else {
        this.left = new IntervalNode(start, end);
      }
    } else {
      // Overlapping or adjacent intervals, merge them
      this.start = Math.min(this.start, start);
      this.end = Math.max(this.end, end);

      // After merging, we might have created overlaps with the left or right subtree
      // We need to find and merge those overlaps
      const left = this.left;
      if (left) {
        const leftMax = left.findMax();
        if (leftMax.end >= this.start - 1) {
          this.start = Math.min(this.start, leftMax.start);
          // Remove the merged node from the left subtree
          this.left = left.remove(leftMax.start, leftMax.end);
        }
      }
      const right = this.right;
      if (right) {
        const rightMin = right.findMin();
        if (rightMin.start <= this.end + 1) {
          this.end = Math.max(this.end, rightMin.end);
          // Remove the merged node from the right subtree
          this.right = right.remove(rightMin.start, rightMin.end);
        }
      }
    }
  }

  // Remove an interval from the tree.
  remove(start: number, end: number): IntervalNode | null {
    if (start > this.end) {
      if (this.right) {
        this.right = this.right.remove(start, end);
      }
    } else if (end < this.start) {
      if (this.left) {
        this.left = this.left.remove(start, end);
      }
    } else {
      // Overlap with the current interval, handle according to the case
      if (start <= this.start && end >= this.end) {
        // Full overlap, attempt to replace this node with a successor/predecessor or remove it
        const left = this.left;
        const right = this.right;
        if (left) {
          const maxLeft = left.findWithStart(start);
          if (!maxLeft) {
            return null; // No predecessor, remove the node
          }
          this.start = maxLeft.start;
          this.end = Math.max(start - 1, maxLeft.end);
          this.left = left.remove(maxLeft.start, maxLeft.end);
        } else if (right) {
          const minRight = right.findWithEnd(end);
          if (!minRight) {
            return null; // No successor, remove the node
          }
          this.start = Math.max(end + 1, minRight.start);
          this.end = minRight.end;
          this.right = minRight.right;
        } else {
          return null; // Node has no children, remove it
        }
      } else if (start > this.start && end < this.end) {
        // The removal range splits the current interval into two.
        // This requires creating a new node for the latter half and adjusting the current node's end.
        const newNode = new IntervalNode(end + 1, this.end);
        this.end = start - 1;

        // Insert the new node into the right place.
        newNode.right = this.right;
        this.right = newNode;
      } else {
        // Partial overlap, adjust the interval of the current node
        if (start <= this.start && end <= this.end) {
          this.start = end + 1;
          this.left = this.left ? this.left.remove(start, this.start - 1) : null;
        } else if (start <= this.end && end >= this.end) {
          this.end = start - 1;
          this.right = this.right ? this.right.remove(this.end + 1, end) : null;
        }
      }
    }

    return this;
  }

  // Get the total number of visible rows
  total(): number {
    const leftTotal = this.left ? this.left.total() : 0;
    const rightTotal = this.right ? this.right.total() : 0;
    return this.end - this.start + 1 + leftTotal + rightTotal;
  }

  // returns the left most node in the tree
  findMin(): IntervalNode {
    if (this.left) {
      return this.left.findMin();
    } else {
      return this;
    }
  }

  // returns the right most node in the tree
  findMax(): IntervalNode {
    if (this.right) {
      return this.right.findMax();
    } else {
      return this;
    }
  }

  // returns the node with the start closest to the given start
  findWithStart(start: number): IntervalNode | null {
    if (this.start <= start) {
      return this;
    } else if (this.left) {
      return this.left.start <= start ? this.left : this.left.findWithStart(start);
    } else {
      return null;
    }
  }

  // returns the node with the end closest to the given end
  findWithEnd(end: number): IntervalNode | null {
    if (this.end >= end) {
      return this;
    } else if (this.right) {
      return this.right.end >= end ? this.right : this.right.findWithEnd(end);
    } else {
      return null;
    }
  }

  // returns the index of the given visible index in the underlying data
  findIndex(visibleIndex: number, offset = 0): number {
    const leftTotal = this.left ? this.left.total() : 0;
    if (visibleIndex < leftTotal + offset) {
      return this.left ? this.left.findIndex(visibleIndex, offset) : -1;
    }
    const selfOffset = visibleIndex - leftTotal - offset;
    if (selfOffset < this.end - this.start + 1) {
      return this.start + selfOffset;
    }
    return this.right ? this.right.findIndex(visibleIndex, leftTotal + (this.end - this.start + 1) + offset) : -1;
  }

  populateVisibleRanges(ranges: Array<[number, number]>) {
    if (this.left) {
      this.left.populateVisibleRanges(ranges);
    }
    ranges.push([this.start, this.end]);
    if (this.right) {
      this.right.populateVisibleRanges(ranges);
    }
  }
}

/*
 * This class is used to keep track of the visible intervals in a list.
 * It is used to keep track of the expand/collapse state of the Pivot Table
 * without having to mutate the actual data.
 */
export class PivotIntervalTree {
  root: IntervalNode | null = null;
  total: number;

  constructor(total: number) {
    this.total = total;
    this.addRange(0, total - 1);
  }

  reset(total: number) {
    this.total = total;
    this.showAll();
  }

  // Show all the data by simply resetting the root node
  showAll() {
    this.root = new IntervalNode(0, this.total - 1);
  }

  // this is called to make range of rows visible (e.g. when user expands a row/column)
  addRange(start: number, end: number) {
    if (!this.root) {
      this.root = new IntervalNode(start, end);
    } else {
      this.root.insert(start, end);
    }
  }

  // this is called to make range of rows invisible (e.g. when user collapses a row/column)
  removeRange(start: number, end: number) {
    if (this.root) {
      this.root = this.root.remove(start, end);
    }
  }

  // to get the total number of visible rows
  totalVisible(): number {
    return this.root ? this.root.total() : 0;
  }

  // to get the original index from the underlying data
  actualIndex(visibleIndex: number): number {
    if (!this.root) {
      return -1;
    }
    return this.root.findIndex(visibleIndex);
  }

  getAllVisibleRanges(): Array<[number, number]> {
    const result: Array<[number, number]> = [];
    if (this.root) {
      this.root.populateVisibleRanges(result);
    }
    return result;
  }
}
