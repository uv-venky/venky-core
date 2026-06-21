import { type Deserializer, type Serializer, type Validator } from '../../../components/core/hooks/useURLStateUtils';
export declare function useURLState<T>(key: string, initialValue: T, { deserialize, serialize, validator, }?: {
    deserialize?: Deserializer<T>;
    serialize?: Serializer<T>;
    validator?: Validator<T>;
}): [T, (val: T | ((prev: T) => T)) => void];
//# sourceMappingURL=useURLState.d.ts.map