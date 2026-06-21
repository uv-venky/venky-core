export type ParamType = 'string' | 'number' | 'boolean' | 'object';
export interface GeneratedParamEntry {
  name: string;
  label: string;
  type: ParamType;
  optional: boolean;
  nullable: boolean;
}
export interface GenerateActionParamSchemasOptions {
  /** Project root used to resolve defaults. Defaults to `process.cwd()`. */
  projectRoot?: string;
  /** Path to the actions index. Defaults to `<root>/src/lib/server/actions/index.ts`. */
  actionsIndexPath?: string;
  /** Output file. Defaults to `<root>/src/lib/server/actions/param-schemas.generated.ts`. */
  outputPath?: string;
  /** tsconfig used to build the program. Defaults to `<root>/tsconfig.json`. */
  tsconfigPath?: string;
  /** Optional logger for progress/warnings. Defaults to `console`. */
  logger?: Pick<Console, 'info' | 'warn'>;
  /** Run the project's biome over the generated file (default `true`). */
  format?: boolean;
}
/**
 * Generate the `param-schemas.generated.ts` file for a project. Returns the
 * absolute path written.
 */
export declare function generateActionParamSchemas(options?: GenerateActionParamSchemasOptions): Promise<string>;
//# sourceMappingURL=action-param-schemas.d.ts.map
