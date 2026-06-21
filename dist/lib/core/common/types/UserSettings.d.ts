export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    notificationLocation?: Position;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    phoneNumber?: string;
    department?: string;
    jobTitle?: string;
    bio?: string;
    sidebarOpen?: boolean;
    logLevel?: LogLevel;
}
//# sourceMappingURL=UserSettings.d.ts.map