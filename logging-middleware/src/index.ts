import axios from "axios";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogStack = "backend" | "frontend";
export type LogPackage =
  | "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service"
  | "api" | "component" | "hook" | "page" | "state" | "style"
  | "auth" | "config" | "middleware" | "utils";

export interface LogOptions {
  clientId?: string;
  clientSecret?: string;
}

export async function Log(
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string,
  options: LogOptions = {}
) {
  try {
    let authHeader = {};

    if (options.clientId && options.clientSecret) {
      const token = Buffer.from(
        `${options.clientId}:${options.clientSecret}`
      ).toString("base64");

      authHeader = { Authorization: `Basic ${token}` };
    } 
    else if (process.env.EVAL_CLIENT_ID && process.env.EVAL_CLIENT_SECRET) {
      const token = Buffer.from(
        `${process.env.EVAL_CLIENT_ID}:${process.env.EVAL_CLIENT_SECRET}`
      ).toString("base64");

      authHeader = { Authorization: `Basic ${token}` };
    }

    const response = await axios.post(
      "http://20.244.56.144/evaluation-service/logs",
      { stack, level, package: pkg, message },
      { headers: { "Content-Type": "application/json", ...authHeader } }
    );

    return response.data;
  } catch (err: any) {
    console.error("Failed to send log:", err.message || err);
  }
}

export function validateLogParams(
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage
) {
  const stacks: LogStack[] = ["backend", "frontend"];
  const levels: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];

  const backendPkgs: LogPackage[] = ["cache","controller","cron_job","db","domain","handler","repository","route","service"];
  const frontendPkgs: LogPackage[] = ["api","component","hook","page","state","style"];
  const commonPkgs: LogPackage[] = ["auth","config","middleware","utils"];

  if (!stacks.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }
  if (!levels.includes(level)) {
    throw new Error(`Invalid level: ${level}`);
  }

  let allowedPkgs: LogPackage[] = [];
  if (stack === "backend") allowedPkgs = [...backendPkgs, ...commonPkgs];
  if (stack === "frontend") allowedPkgs = [...frontendPkgs, ...commonPkgs];

  if (!allowedPkgs.includes(pkg)) {
    throw new Error(`Invalid package for stack ${stack}`);
  }
}