export type Column = {
  name: string;
  type: string;
  maxLength: number;
  nullable: boolean;
  allowDecimals: boolean;
  excludeTime: boolean;
  primary?: boolean;
};

export type Table = {
  table_schema: string;
  table_name: string;
  table_type: string;
};

export type State = {
  index?: number;
  tableName: string;
  dsName: string;
  editable: boolean;
  template: string;
  columns: Column[];
  fullPath: string;
  createPage: boolean;
  moduleCode: string;
  subModuleCode: string;
  schemaName: string;
  pageRouteName: string;
  columnOrder: string[];
};

export type GenerateCode = (state: State) => string;

export interface HandleGenerateProps {
  state: State;
  fullPath: string;
  genCode: (state: State, generateCodeFn: GenerateCode, filePath: string) => Promise<void>;
  resolveApp: (...relativePath: string[]) => string;
  updateActionsIndex: (state: State) => void;
}

export type HandleGenerateFn = (props: HandleGenerateProps) => void;

export interface TemplateOption {
  name: string;
  value: string;
  description?: string;
}

// Server-side template option with handleGenerate function
export interface TemplateCodeGenFunction {
  value: string;
  handleGenerate: HandleGenerateFn;
}
