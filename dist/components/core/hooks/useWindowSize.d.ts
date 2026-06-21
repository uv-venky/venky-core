interface WindowSize {
    width: number;
    height: number;
}
interface UseWindowSizeOptions {
    debounceMs?: number;
    initialSize?: WindowSize;
}
export default function useWindowSize(options?: UseWindowSizeOptions): WindowSize;
export {};
//# sourceMappingURL=useWindowSize.d.ts.map