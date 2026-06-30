import fs from "fs/promises";
import path from "path";

const BASE = process.cwd();

export async function readDemoJSON<T = any>(filename: string): Promise<T[]> {
  try {
    const p = path.join(BASE, filename);
    const data = await fs.readFile(p, "utf-8");
    return JSON.parse(data);
  } catch { return []; }
}

export async function writeDemoJSON(filename: string, data: any) {
  try {
    const p = path.join(BASE, filename);
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
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
