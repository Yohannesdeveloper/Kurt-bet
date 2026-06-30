import fs from "fs/promises";
import path from "path";
import { cacheGet, cacheSet, cacheDel } from "./redis";

const BASE = process.cwd();

function redisKey(filename: string): string {
  return `demo:data:${filename.replace(/^\./, "")}`;
}

export async function readDemoJSON<T = any>(filename: string): Promise<T[]> {
  const rk = redisKey(filename);
  const fromRedis = await cacheGet<T[]>(rk);
  if (fromRedis) return fromRedis;
  try {
    const p = path.join(BASE, filename);
    const data = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(data);
    await cacheSet(rk, parsed, 0);
    return parsed;
  } catch { return []; }
}

export async function writeDemoJSON(filename: string, data: any) {
  const rk = redisKey(filename);
  const json = JSON.stringify(data);
  try {
    await cacheSet(rk, data, 0);
  } catch {}
  try {
    const p = path.join(BASE, filename);
    await fs.writeFile(p, json, "utf-8");
  } catch {}
}

export async function delDemoJSON(filename: string) {
  const rk = redisKey(filename);
  await cacheDel(rk);
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
