/* Copyright (c) 2024-present Venky Corp. */

import { getConfig } from './config';

/** True unless `features.naturalLanguageSearch: false` in config YAML (`config/default.yml` or env overlay). Omitted or `true` enables NL parse on the server. */
export function isNaturalLanguageSearchEnabled(): boolean {
  return getConfig('isNaturalLanguageSearchEnabled').features?.naturalLanguageSearch !== false;
}
