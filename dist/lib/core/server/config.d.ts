/** Inline SMTP config type — avoids importing nodemailer (which pulls Node built-ins into client bundles via Vite). */
export interface SmtpOptions {
    from?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    requireTLS?: boolean;
    auth?: {
        user?: string;
        pass?: string;
    };
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
export declare function getConfig(name: string): AppConfig;
export {};
//# sourceMappingURL=config.d.ts.map