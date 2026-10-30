import { existsSync } from "node:fs";
import { resolve } from "node:path";

if (existsSync(resolve(process.cwd(), ".env"))) process.loadEnvFile();

function required(name: "ADMIN_PASSWORD" | "SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = Object.freeze({
  ADMIN_PASSWORD: required("ADMIN_PASSWORD"),
  SESSION_SECRET: required("SESSION_SECRET"),
  OWNER_NAME: process.env.OWNER_NAME || "",
  OWNER_POSITION: process.env.OWNER_POSITION || "",
  CF_SITE_TAG: process.env.CF_SITE_TAG || "",
  DATABASE_PATH: resolve(process.cwd(), process.env.DATABASE_PATH || "./data/portfolio.sqlite"),
  NODE_ENV: process.env.NODE_ENV,
});
