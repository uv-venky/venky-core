import { type Validator } from '../../../components/core/hooks/useURLStateUtils';
export declare function useURLStringState<T extends string>(key: string, initialValue: string, validator?: Validator<T>): [T, (val: T | ((prev: T) => T)) => void];
//# sourceMappingURL=useURLStringState.d.ts.map