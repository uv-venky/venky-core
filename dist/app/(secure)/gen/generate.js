/* Copyright (c) 2024-present Venky Corp. */
'use server';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import fs from 'fs-extra';
import { existsSync, mkdirSync } from 'node:fs';
import { exec } from 'node:child_process';
import logger from '../../../lib/core/server/logger';
import generateDS from './templates/data-source/ds';
import generateType from './templates/data-source/type';
import generateUseStore from './templates/common/use-store';
import generateSmartSearchColumns from './templates/common/smart-search-columns';
import generateTableColumns from './templates/common/table-columns';
import generateEditForm from './templates/common/edit-form';
import { getCodeGenFunction } from './template-registry';
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (...relativePath) => path.resolve(appDirectory, ...relativePath);
function mkDirs(filePath) {
  const dirPath = path.dirname(filePath);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}
async function formatFile(filePath) {
  const biome = resolveApp('node_modules/.bin/biome');
  const command = `${biome} format --config-path "${resolveApp('biome.jsonc')}" --write "${filePath}"`;
  exec(command, (err, _stdout, stderr) => {
    if (err) {
      logger.error('Error running Biome:', stderr);
      return;
    }
  });
}
async function updateDataSourceIndex(dsName, moduleCode) {
  const indexPath = resolveApp('src/lib/server/ds/defs', moduleCode ? `${moduleCode}/` : '', 'index.ts');
  const importStatement = `import { ${dsName}DS } from './${dsName}DS';`;
  const isWindows = process.platform === 'win32';
  const newline = isWindows ? '\r\n' : '\n';
  const exportStatement = `  ${dsName}: ${dsName}DS,${newline}`;
  let indexContent = readFileSync(indexPath, 'utf8');
  if (!indexContent.includes(importStatement)) {
    indexContent = indexContent.replace('import ', `${importStatement}${newline}import `);
  }
  if (!indexContent.includes(exportStatement)) {
    const pattern = /export const (.*) = {\r?\n/;
    indexContent = indexContent.replace(pattern, `export const $1 = {${newline}${exportStatement}`);
  }
  writeFileSync(indexPath, indexContent);
  await formatFile(indexPath);
  if (logger.infoEnabled) {
    logger.info(`Updated data source index file: ${indexPath}`);
  }
}
async function genCode(state, generateCodeFn, filePath) {
  const rendered = generateCodeFn(state);
  mkDirs(filePath);
  writeFileSync(filePath, rendered);
  await formatFile(filePath);
  if (logger.infoEnabled) {
    logger.info(`Created file: ${filePath}`);
  }
}
async function updateActionsIndex({ dsName, moduleCode, subModuleCode, pageRouteName }) {
  const indexPath = resolveApp(`src/lib/server/actions/${moduleCode}.ts`);
  const importStatement = `import { get${dsName}ChartData } from '@/app/(secure)/${moduleCode}/${subModuleCode ? `${subModuleCode}/` : ''}${pageRouteName}/data';`;
  const isWindows = process.platform === 'win32';
  const newline = isWindows ? '\r\n' : '\n';
  const exportStatement = `  get${dsName}ChartData: get${dsName}ChartData,${newline}`;
  const accessRolesStatement = `  get${dsName}ChartData: ['all_users'],${newline}`;
  let indexContent = readFileSync(indexPath, 'utf8');
  if (!indexContent.includes(importStatement)) {
    indexContent = indexContent.replace('import ', `${importStatement}${newline}import `);
  }
  if (!indexContent.includes(exportStatement)) {
    let pattern = /export const (.*)ACTIONS = {\r?\n/;
    indexContent = indexContent.replace(pattern, `export const $1ACTIONS = {${newline}${exportStatement}`);
    pattern = /export const (.*)ACTION_ACCESS_ROLES(.*) = {\r?\n/;
    indexContent = indexContent.replace(
      pattern,
      `export const $1ACTION_ACCESS_ROLES$2 = {${newline}${accessRolesStatement}`,
    );
  }
  writeFileSync(indexPath, indexContent);
  await formatFile(indexPath);
  if (logger.infoEnabled) {
    logger.info(`Updated actions index file: ${indexPath}`);
  }
}
export default async function generate(state) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Code Generator Page is only available in development mode');
  }
  const { dsName, moduleCode, pageRouteName, subModuleCode, createPage } = state;
  const codeGenFunction = getCodeGenFunction(state.template);
  if (!codeGenFunction) {
    throw new Error(`Template not found: ${state.template}`);
  }
  const fileName = `${dsName}DS.ts`;
  let filePath = resolveApp('src/lib/server/ds/defs', moduleCode ? `${moduleCode}/${fileName}` : fileName);
  genCode(state, generateDS, filePath);
  filePath = resolveApp('src/lib/common/ds/types', moduleCode ? `${moduleCode}/${dsName}.ts` : `${dsName}.ts`);
  genCode(state, generateType, filePath);
  updateDataSourceIndex(dsName, moduleCode);
  if (createPage) {
    let path = '';
    if (moduleCode) {
      path += `/${moduleCode}`;
    }
    if (subModuleCode) {
      path += `/${subModuleCode}`;
    }
    path += `/${pageRouteName}`;
    const fullPath = `src/app/(secure)${path}`;
    const fileName = 'use-store.ts';
    filePath = resolveApp(fullPath, 'hooks', fileName);
    genCode(state, generateUseStore, filePath);
    filePath = resolveApp(fullPath, 'hooks', 'smart-search-columns.ts');
    genCode(state, generateSmartSearchColumns, filePath);
    filePath = resolveApp(fullPath, 'hooks', 'table-columns.tsx');
    genCode(state, generateTableColumns, filePath);
    filePath = resolveApp(fullPath, 'components', 'edit-form.tsx');
    genCode(state, generateEditForm, filePath);
    codeGenFunction({ state, fullPath, genCode, resolveApp, updateActionsIndex });
  }
}
//# sourceMappingURL=generate.js.map
