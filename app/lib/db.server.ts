import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import schema from "~/db/schema.sql?raw";
import { env } from "~/lib/env.server";

const globalDb = globalThis as typeof globalThis & { portfolioDb?: Database.Database };

function openDatabase() {
  mkdirSync(dirname(env.DATABASE_PATH), { recursive: true });
  const database = new Database(env.DATABASE_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(schema);
  return database;
}

export const db = globalDb.portfolioDb ?? openDatabase();
if (env.NODE_ENV !== "production") globalDb.portfolioDb = db;
