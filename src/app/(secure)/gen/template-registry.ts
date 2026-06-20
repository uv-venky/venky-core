/* Copyright (c) 2024-present Venky Corp. */

import type { HandleGenerateFn, TemplateCodeGenFunction } from './types';
import logger from '@/lib/core/server/logger';
import generatePageLayoutPageContent from './templates/page-layout/page-content';
import generateSimplePageContent from './templates/simple/page-content';
import generatePage from './templates/common/page';
import generateFilterBar from './templates/table-with-search/filter-bar';
import generateTableWithSearch from './templates/table-with-search/table-with-search';
import generateTableWithSearchTable from './templates/table-with-search/table';
import type { HandleGenerateProps } from './types';

declare global {
  var _$venkyCodeGenFunctions: Map<string, HandleGenerateFn> | undefined;
}

// Initialize registry with default templates
if (!globalThis._$venkyCodeGenFunctions) {
  const map = new Map<string, HandleGenerateFn>();

  // Simple template
  map.set('simple', ({ state, fullPath, genCode, resolveApp }: HandleGenerateProps) => {
    let filePath = resolveApp(fullPath, 'page-content.tsx');
    genCode(state, generateSimplePageContent, filePath);
    filePath = resolveApp(fullPath, 'page.tsx');
    genCode(state, generatePage, filePath);
  });

  // Page Layout template
  map.set('page-layout', ({ state, fullPath, genCode, resolveApp }: HandleGenerateProps) => {
    let filePath = resolveApp(fullPath, 'page-content.tsx');
    genCode(state, generatePageLayoutPageContent, filePath);
    filePath = resolveApp(fullPath, 'page.tsx');
    genCode(state, generatePage, filePath);
  });

  // Table with Search template
  map.set('table-with-search', ({ state, fullPath, genCode, resolveApp }: HandleGenerateProps) => {
    let filePath = resolveApp(fullPath, 'components', 'filter-bar.tsx');
    genCode(state, generateFilterBar, filePath);

    filePath = resolveApp(fullPath, 'components', 'table.tsx');
    genCode(state, generateTableWithSearchTable, filePath);

    filePath = resolveApp(fullPath, 'components', 'table-with-search.tsx');
    genCode(state, generateTableWithSearch, filePath);
  });

  globalThis._$venkyCodeGenFunctions = map;
}

export function registerCodeGenFunctions(templates: TemplateCodeGenFunction[]): void {
  const map = globalThis._$venkyCodeGenFunctions;
  if (!map) {
    throw new Error('Template registry not initialized');
  }
  logger.info(`Registering ${templates.length} templates to ${map.size} existing templates`);
  templates.forEach((template) => {
    map.set(template.value, template.handleGenerate);
  });
}

export function getCodeGenFunction(value: string): HandleGenerateFn | undefined {
  const map = globalThis._$venkyCodeGenFunctions;
  if (!map) {
    throw new Error('Template registry not initialized');
  }
  return map.get(value);
}
