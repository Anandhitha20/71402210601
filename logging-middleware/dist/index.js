"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
exports.validateLogParams = validateLogParams;
const axios_1 = __importDefault(require("axios"));
async function Log(stack, level, pkg, message, options = {}) {
    try {
        let authHeader = {};
        if (options.clientId && options.clientSecret) {
            const token = Buffer.from(`${options.clientId}:${options.clientSecret}`).toString("base64");
            authHeader = { Authorization: `Basic ${token}` };
        }
        else if (process.env.EVAL_CLIENT_ID && process.env.EVAL_CLIENT_SECRET) {
            const token = Buffer.from(`${process.env.EVAL_CLIENT_ID}:${process.env.EVAL_CLIENT_SECRET}`).toString("base64");
            authHeader = { Authorization: `Basic ${token}` };
        }
        const response = await axios_1.default.post("http://20.244.56.144/evaluation-service/logs", { stack, level, package: pkg, message }, { headers: { "Content-Type": "application/json", ...authHeader } });
        return response.data;
    }
    catch (err) {
        console.error("Failed to send log:", err.message || err);
    }
}
function validateLogParams(stack, level, pkg) {
    const stacks = ["backend", "frontend"];
    const levels = ["debug", "info", "warn", "error", "fatal"];
    const backendPkgs = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
    const frontendPkgs = ["api", "component", "hook", "page", "state", "style"];
    const commonPkgs = ["auth", "config", "middleware", "utils"];
    if (!stacks.includes(stack)) {
        throw new Error(`Invalid stack: ${stack}`);
    }
    if (!levels.includes(level)) {
        throw new Error(`Invalid level: ${level}`);
    }
    let allowedPkgs = [];
    if (stack === "backend")
        allowedPkgs = [...backendPkgs, ...commonPkgs];
    if (stack === "frontend")
        allowedPkgs = [...frontendPkgs, ...commonPkgs];
    if (!allowedPkgs.includes(pkg)) {
        throw new Error(`Invalid package for stack ${stack}`);
    }
}
