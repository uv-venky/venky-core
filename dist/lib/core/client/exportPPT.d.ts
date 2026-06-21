interface Section {
    title: string;
    refs: React.RefObject<HTMLElement | null>[];
}
interface Options {
    fileName?: string;
    coverTitle: string;
    dashboardRef?: React.RefObject<HTMLElement | null>;
    summary?: Record<string, any>;
    sections: Section[];
}
export declare function exportDashboardPPT({ fileName, coverTitle, dashboardRef, summary, sections, }: Options): Promise<void>;
export {};
//# sourceMappingURL=exportPPT.d.ts.map