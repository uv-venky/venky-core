/* Copyright (c) 2023-present Venky Corp. */
import { ArrowLeftToLine, ArrowRightToLine, ArrowLeftRight, Calendar1, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Circle, CircleMinus, CircleOff, CirclePlus, ClipboardList, ClipboardX, Equal, EqualNot, ListChecks, ListMinus, ListTodo, SquareChevronLeft, SquareChevronRight, } from 'lucide-react';
import { getDefaultOperatorForType, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, } from '../../../components/core/smart-search/operators-meta';
const OPS_ICONS = {
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
function getDefaultOperator(a) {
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
export { CASE_SENSITIVE_OPS } from '../../../components/core/smart-search/operators-meta';
export { getDefaultOperator, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, OPS_ICONS };
//# sourceMappingURL=operators.js.map