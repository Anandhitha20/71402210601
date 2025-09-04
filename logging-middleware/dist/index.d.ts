export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogStack = "backend" | "frontend";
export type LogPackage = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
export interface LogOptions {
    clientId?: string;
    clientSecret?: string;
}
export declare function Log(stack: LogStack, level: LogLevel, pkg: LogPackage, message: string, options?: LogOptions): Promise<any>;
export declare function validateLogParams(stack: LogStack, level: LogLevel, pkg: LogPackage): void;
