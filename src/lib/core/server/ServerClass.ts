import type { ServerConfig } from './ServerConfig';

export class ServerClass {
  config: ServerConfig;
  constructor(config: ServerConfig) {
    this.config = config;
  }
}

declare global {
  var _$venkyServer: ServerClass | undefined;
}
