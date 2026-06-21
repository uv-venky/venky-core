import { type Path } from '../../../components/core/mutX/ImmutableTypes';
type Props<T extends object> = {
    path: Path;
    readOnly?: boolean;
    stickyFilters?: (keyof T)[];
};
declare const _default: <T extends object>(props: Props<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=NestedEntry.d.ts.map