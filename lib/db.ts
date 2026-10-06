import fs from "node:fs";
import path from "node:path";

// Tiny JSON file store for admin data (config, leads, usage, posts). Files live in ./.data (git-ignored).
// ponytail: single-process file store. On serverless (read-only disk) or several instances, swap these two functions for a database.
export const dataDir = () => process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

export function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir(), name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, data: unknown) {
  fs.mkdirSync(dataDir(), { recursive: true });
  const file = path.join(dataDir(), name);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file); // atomic replace: a crash never leaves half a file
}
