/* Copyright (c) 2023-present Venky Corp. */

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowLeftRight,
  Calendar1,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleMinus,
  CircleOff,
  CirclePlus,
  ClipboardList,
  ClipboardX,
  Equal,
  EqualNot,
  ListChecks,
  ListMinus,
  ListTodo,
  type LucideProps,
  SquareChevronLeft,
  SquareChevronRight,
} from 'lucide-react';
import type { Column } from '@/components/core/smart-search/types';
import {
  getDefaultOperatorForType,
  getDefaultValue,
  getOptionsForType,
  hasEditor,
  isMultiOperator,
  type OPS_KEY_TYPE,
} from '@/components/core/smart-search/operators-meta';

const OPS_ICONS: Record<
  OPS_KEY_TYPE,
  React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>
> = {
  after: ChevronRight,
  before: ChevronLeft,
  bn: ArrowLeftRight,
  empty: CircleOff,
  eq: Equal,
  ew: ArrowRightToLine,
  gt: ChevronRight,
  gte: ChevronRight,
  hasall: ListChecks,
  hasany: ListTodo,
  in: ClipboardList,
  inthefuture: ChevronRight,
  inthepast: ChevronLeft,
  is: Equal,
  istrue: Equal,
  last14days: CalendarDays,
  last28days: CalendarDays,
  last7days: CalendarRange,
  like: CirclePlus,
  lt: ChevronLeft,
  lte: ChevronLeft,
  nct: CircleMinus,
  ne: EqualNot,
  next14days: CalendarDays,
  next28days: CalendarDays,
  next7days: CalendarRange,
  nin: ClipboardX,
  not: EqualNot,
  notany: ListMinus,
  notempty: Circle,
  notnull: Circle,
  noton: EqualNot,
  null: CircleOff,
  on: Equal,
  onorafter: SquareChevronRight,
  onorbefore: SquareChevronLeft,
  sw: ArrowLeftToLine,
  thismonth: CalendarDays,
  thisquarter: CalendarDays,
  thisweek: CalendarRange,
  thisyear: CalendarDays,
  today: Calendar1,
  tomorrow: Calendar1,
  yesterday: Calendar1,
};

function getDefaultOperator(a: Column<any, any>) {
  let op = a.defaultOperator;
  if (op) {
    const options = getOptionsForType(a.type);
    if (options.find((o) => o.value === op)) {
      return op;
    }
  }
  op = getDefaultOperatorForType(a.type);
  return op;
}

export type {
  BOOLEAN_OPS_KEY_TYPE,
  DATE_OPS_KEY_TYPE,
  NUMBER_OPS_KEY_TYPE,
  OPS_KEY_TYPE,
  SELECT_OPS_KEY_TYPE,
  STRING_OPS_KEY_TYPE,
  YN_TF_OPS_KEY_TYPE,
} from '@/components/core/smart-search/operators-meta';

export { CASE_SENSITIVE_OPS } from '@/components/core/smart-search/operators-meta';

export { getDefaultOperator, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, OPS_ICONS };
