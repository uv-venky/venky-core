declare global {
    interface Window {
        FusionCharts: any;
        _$loadingPromise: Promise<void> | null;
    }
}
export default function useFusionLoader(): boolean;
//# sourceMappingURL=useFusionLoader.d.ts.map