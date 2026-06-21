interface Props {
    /**
     * Filename for the downloaded CSV. The pivot-layout export uses this value as-is;
     * the raw-rows export appends a `-raw` suffix before the extension.
     * Defaults to "pivot-data.csv".
     */
    filename?: string;
}
export default function PivotCsvDownloadOptionsButton({ filename }?: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PivotCsvDownloadOptionsButton.d.ts.map