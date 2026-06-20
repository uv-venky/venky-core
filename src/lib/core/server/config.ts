import fs from 'node:fs';
import os from 'node:os';
import yaml from 'js-yaml';
/** Inline SMTP config type — avoids importing nodemailer (which pulls Node built-ins into client bundles via Vite). */
export interface SmtpOptions {
  from?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  requireTLS?: boolean;
  auth?: { user?: string; pass?: string };
  [key: string]: unknown;
}

interface AdminConfig {
  email: string;
  password: string;
}

export interface AppConfig {
  appId: string;
  /** Scheduler instance ID for job isolation. 'production' in prod, hostname/custom in dev. */
  schedulerId: string;
  smtp: SmtpOptions;
  pythonService: {
    baseUrl: string;
  };
  init: {
    admin: AdminConfig;
  };
  dbUrl: string;
  readonlyDbUrl?: string;
  orgName: string;
  secret: string;
  adminAlertEmails: string[];
  /** Feature flags from config/default.yml (and env). Jobs register only when explicitly set to true. */
  features?: {
    workflow?: boolean;
    complianceExport?: boolean;
    naturalLanguageSearch?: boolean;
  };
}

const parsers = {
  number: (value: string) => {
    const result = Number(value);
    if (Number.isNaN(result)) {
      throw new Error('Value is not a number');
    }
    return result;
  },
  boolean: (value: string) => {
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      throw new Error('Value is not a boolean');
    }
  },
};

function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

function setPath(object: Record<string, unknown>, path: string[], value: unknown) {
  if (value === null || path.length === 0) {
    return;
  } else if (path.length === 1) {
    // no more keys to make, so set the value
    object[path.shift() as string] = value;
  } else {
    const nextKey = path.shift() as string;
    if (!Object.hasOwn(object, nextKey)) {
      object[nextKey] = {};
    }
    setPath(object[nextKey] as Record<string, unknown>, path, value);
  }
}

function parseString(value: string, format: string) {
  if (format === 'number') {
    return parsers.number(value);
  } else if (format === 'boolean') {
    return parsers.boolean(value);
  } else {
    throw new Error('Unknown format');
  }
}

function substituteDeep(substitutionMap: Record<string, unknown>, variables: Record<string, string>) {
  const result = {};

  function _substituteVars(map: Record<string, unknown>, vars: Record<string, string>, pathTo: string[]) {
    for (const prop in map) {
      const value = map[prop];
      if (typeof value === 'string') {
        // We found a leaf variable name
        if (typeof vars[value] !== 'undefined' && vars[value] !== '') {
          // if the vars provide a value set the value in the result map
          setPath(result, pathTo.concat(prop), vars[value]);
        }
      } else if (isObject(value)) {
        const name = value.__name as string;
        const format = value.__format as string;
        // work on the subtree, giving it a clone of the pathTo
        if (name && format && typeof vars[name] !== 'undefined' && vars[name] !== '') {
          let parsedValue: unknown;
          try {
            parsedValue = parseString(vars[name] as string, format);
          } catch (err) {
            const e = err as Error;
            e.message = `__format parser error in ${value.__name}: ${e.message}`;
            throw e;
          }
          setPath(result, pathTo.concat(prop), parsedValue);
        } else {
          _substituteVars(value, vars, pathTo.concat(prop));
        }
      } else {
        const msg = `Illegal key type for substitution map at ${pathTo.join('.')}: ${typeof value}`;
        throw new Error(msg);
      }
    }
  }

  _substituteVars(substitutionMap, variables, []);
  return result;
}

function deepCopy(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (Array.isArray(source[key])) {
          target[key] = [];
        } else if (!isObject(target[key])) {
          target[key] = {};
        }
        deepCopy(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        target[key] = source[key];
      }
    }
  }
}

function loadYaml(name: string): Record<string, unknown> {
  return yaml.load(fs.readFileSync(`./config/${name}.yml`, 'utf8')) as Record<string, unknown>;
}

function loadConfig(name: string): AppConfig {
  if (process.env.NODE_ENV !== 'test') {
    console.info(`Loading config for ${name}`);
  }
  if (!fs.existsSync(`./config/default.yml`)) {
    throw new Error(`${name}: No default config found!`);
  }
  const doc = loadYaml('default');
  const NODE_ENV = process.env.NODE_ENV;
  if (NODE_ENV && fs.existsSync(`./config/${NODE_ENV}.yml`)) {
    const envDoc = loadYaml(NODE_ENV);
    deepCopy(doc, envDoc);
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`${name}: ./config/${NODE_ENV}.yml not found! Using only default config.`);
    }
  }
  if (fs.existsSync(`./config/local.yml`)) {
    const localDoc = loadYaml('local');
    deepCopy(doc, localDoc);
  }
  if (fs.existsSync(`./config/env.yml`)) {
    const envMap = loadYaml('env');
    const envDoc = substituteDeep(envMap, process.env as Record<string, string>);
    deepCopy(doc, envDoc);
  }

  // Compute schedulerId for job isolation
  doc.schedulerId = getSchedulerId();

  return doc as unknown as AppConfig;
}

/**
 * Get the scheduler ID for job isolation.
 * - Production (NODE_ENV=production): Always 'production'
 * - Development: Uses SCHEDULER_ID env var or hostname, but cannot be 'production'
 */
function getSchedulerId(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  const schedulerId = process.env.SCHEDULER_ID || os.hostname();

  if (schedulerId === 'production') {
    throw new Error('SCHEDULER_ID cannot be "production" in development mode');
  }

  return schedulerId;
}

let config: AppConfig | undefined;

export function getConfig(name: string): AppConfig {
  if (!config) {
    config = loadConfig(name);
  } else {
    // logger.info(`Config already loaded: ${name}`);
  }
  return config;
}
