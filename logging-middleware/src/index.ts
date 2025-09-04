import axios, { AxiosInstance } from "axios";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type BackendPkg = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service";
type FrontendPkg = "api" | "component" | "hook" | "page" | "state" | "style";
type CommonPkg = "auth" | "config" | "middleware" | "utils";
type PackageName = BackendPkg | FrontendPkg | CommonPkg;

const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES = ["cache","controller","cron_job","db","domain","handler","repository","route","service"];
const VALID_FRONTEND_PACKAGES = ["api","component","hook","page","state","style"];
const VALID_COMMON_PACKAGES = ["auth","config","middleware","utils"];

let http: AxiosInstance;
let baseURL = "http://20.244.56.144/evaluation-service/logs";
let authHeader: { Authorization?: string } = {};

export function initLogger(options?: { baseUrl?: string, clientId?: string, clientSecret?: string }) {
  if (options?.baseUrl) baseURL = options.baseUrl;
  if (options?.clientId && options?.clientSecret) {
    const token = Buffer.from(${options.clientId}:${options.clientSecret}).toString("base64");
    authHeader = { Authorization: Basic ${token} };
  } else if (process.env.EVAL_CLIENT_ID && process.env.EVAL_CLIENT_SECRET) {
    const token = Buffer.from(${process.env.EVAL_CLIENT_ID}:${process.env.EVAL_CLIENT_SECRET}).toString("base64");
    authHeader = { Authorization: Basic ${token} };
  }
  http = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...authHeader
    },
    timeout: 5000
  });
}

function validate(stack: string, level: string, pkg: string) {
  if (!VALID_STACKS.includes(stack)) throw new Error("Invalid stack");
  if (!VALID_LEVELS.includes(level)) throw new Error("Invalid level");

  const allowedPkgs = stack === "backend"
    ? [...VALID_BACKEND_PACKAGES, ...VALID_COMMON_PACKAGES]
    : [...VALID_FRONTEND_PACKAGES, ...VALID_COMMON_PACKAGES];

  if (!allowedPkgs.includes(pkg)) throw new Error(Invalid package for stack ${stack});
}

export async function Log(stack: Stack, level: Level, pkg: PackageName, message: string) {
  try {
    if (!http) initLogger(); // ensure initialized
    validate(stack, level, pkg);
    const body = { stack, level, package: pkg, message };
    const res = await http.post("", body);
    // return response for caller if they want to inspect
    return res.data;
  } catch (err: any) {
    // IMPORTANT: Do not use console.log for app instrumentation in final solution.
    // This error handling is local fallback so your app doesn't crash if logging fails.
    // In interview scenario it's fine to show this in developer console, but the real logs should go to test server.
    // We return an object indicating failure.
    return { error: true, message: err?.message || String(err) };
  }
}