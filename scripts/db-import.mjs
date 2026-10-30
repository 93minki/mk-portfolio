import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

if (existsSync(resolve(process.cwd(), ".env"))) process.loadEnvFile();
const args = process.argv.slice(2);
const force = args.includes("--force");
const files = args.filter((arg) => arg !== "--force");
if (files.length !== 1) throw new Error("Usage: npm run db:import -- <path-to.sql> [--force]");
const sql = readFileSync(resolve(files[0]), "utf8");
const path = resolve(process.cwd(), process.env.DATABASE_PATH || "./data/portfolio.sqlite");
const tables = ["skills", "personal_info", "experiences", "projects"];
mkdirSync(dirname(path), { recursive: true });
if (force) {
  for (const suffix of ["", "-wal", "-shm"]) rmSync(path + suffix, { force: true });
}
const db = new Database(path);
try {
  for (const table of tables) {
    const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
    if (exists && db.prepare(`SELECT 1 FROM "${table}" LIMIT 1`).get()) {
      throw new Error(`Database contains rows in ${table}; use --force to replace it.`);
    }
  }
  const isExport = /\bCREATE\s+TABLE\b/i.test(sql);
  db.transaction(() => {
    if (isExport) {
      for (const table of tables) db.exec(`DROP TABLE IF EXISTS "${table}"`);
    } else db.exec(readFileSync(new URL("../app/db/schema.sql", import.meta.url), "utf8"));
    db.exec(sql);
  })();
  for (const table of tables) {
    console.log(`${table}: ${db.prepare(`SELECT COUNT(*) AS count FROM "${table}"`).get().count}`);
  }
} finally {
  db.close();
}
