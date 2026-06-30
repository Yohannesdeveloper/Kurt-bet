import fs from "fs/promises";
import path from "path";
import { cacheGet, cacheSet, cacheDel } from "./redis";

const BASE = process.cwd();
const DEMO_TTL = 15;

function fileCacheKey(filename: string): string {
  return `demo:file:${filename.replace(/^\./, "")}`;
}

export async function readDemoJSON<T = any>(filename: string): Promise<T[]> {
  const ck = fileCacheKey(filename);
  const cached = await cacheGet<T[]>(ck);
  if (cached) return cached;
  try {
    const p = path.join(BASE, filename);
    const data = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(data);
    await cacheSet(ck, parsed, DEMO_TTL);
    return parsed;
  } catch { return []; }
}

export async function writeDemoJSON(filename: string, data: any) {
  try {
    const p = path.join(BASE, filename);
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    await cacheDel(fileCacheKey(filename));
  } catch {}
}

export function readDemoJSONSync<T = any>(filename: string): T[] {
  try {
    const p = path.join(BASE, filename);
    const data = require("fs").readFileSync(p, "utf-8");
    return JSON.parse(data);
  } catch { return []; }
}

export function writeDemoJSONSync(filename: string, data: any) {
  try {
    const p = path.join(BASE, filename);
    require("fs").writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}
