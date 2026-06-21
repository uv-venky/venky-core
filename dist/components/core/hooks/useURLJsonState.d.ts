import { type Validator } from '../../../components/core/hooks/useURLStateUtils';
export declare function useURLJsonState<T>(key: string, initialValue: T, validator?: Validator<T>): [T, (val: T | ((prev: T) => T)) => void];
//# sourceMappingURL=useURLJsonState.d.ts.map