import { NextRequest, NextResponse } from "next/server";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";
import { ensureDemoItemsSeeded } from "@/lib/demo-menu-data";

async function readDemoItems(): Promise<any[]> { return readDemoJSON(".demo-menu-items.json"); }
async function writeDemoItems(items: any[]) { await writeDemoJSON(".demo-menu-items.json", items); }
async function readDeletedIds(): Promise<string[]> { return readDemoJSON(".demo-deleted-items.json"); }
async function writeDeletedIds(ids: string[]) { await writeDemoJSON(".demo-deleted-items.json", ids); }

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  await ensureDemoItemsSeeded();

  const items = await readDemoItems();
  const idx = items.findIndex((i: any) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });

  items[idx] = { ...items[idx], ...body, id: params.id };
  await writeDemoItems(items);

  return NextResponse.json({ success: true, data: items[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = await readDemoItems();
  const index = items.findIndex((i: any) => i.id === params.id);
  if (index !== -1) {
    items.splice(index, 1);
    await writeDemoItems(items);
  }
  const deleted = await readDeletedIds();
  if (!deleted.includes(params.id)) {
    deleted.push(params.id);
    await writeDeletedIds(deleted);
  }
  return NextResponse.json({ success: true, data: { id: params.id } });
}
