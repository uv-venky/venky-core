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
export declare function exportDashboardPDF({ fileName, coverTitle, dashboardRef, summary, sections, }: Options): Promise<void>;
export {};
//# sourceMappingURL=exportPDF.d.ts.map