interface SchemaExplorerProps {
    onTableDoubleClick?: (schemaName: string, tableName: string) => void;
    onAddTab?: (sql: string, name: string) => void;
}
export default function SchemaExplorer({ onTableDoubleClick, onAddTab }: SchemaExplorerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SchemaExplorer.d.ts.map