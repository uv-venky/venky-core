import { type LucideProps } from 'lucide-react';
import type { Column } from '../../../components/core/smart-search/types';
import { getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, type OPS_KEY_TYPE } from '../../../components/core/smart-search/operators-meta';
declare const OPS_ICONS: Record<OPS_KEY_TYPE, React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>>;
declare function getDefaultOperator(a: Column<any, any>): "on" | "null" | "in" | "is" | "not" | "empty" | "notempty" | "nct" | "like" | "sw" | "ew" | "hasall" | "hasany" | "notany" | "nin" | "eq" | "ne" | "notnull" | "gt" | "gte" | "lt" | "lte" | "bn" | "after" | "before" | "inthefuture" | "inthepast" | "last14days" | "last28days" | "last7days" | "next14days" | "next28days" | "next7days" | "noton" | "onorafter" | "onorbefore" | "thismonth" | "thisquarter" | "thisweek" | "thisyear" | "today" | "tomorrow" | "yesterday" | "istrue";
export type { BOOLEAN_OPS_KEY_TYPE, DATE_OPS_KEY_TYPE, NUMBER_OPS_KEY_TYPE, OPS_KEY_TYPE, SELECT_OPS_KEY_TYPE, STRING_OPS_KEY_TYPE, YN_TF_OPS_KEY_TYPE, } from '../../../components/core/smart-search/operators-meta';
export { CASE_SENSITIVE_OPS } from '../../../components/core/smart-search/operators-meta';
export { getDefaultOperator, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, OPS_ICONS };
//# sourceMappingURL=operators.d.ts.map