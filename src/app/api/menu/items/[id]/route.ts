import { NextRequest, NextResponse } from "next/server";
import { readDemoJSONSync, writeDemoJSONSync } from "@/lib/demo-storage";

function readDemoItems(): any[] { return readDemoJSONSync(".demo-menu-items.json"); }
function writeDemoItems(items: any[]) { writeDemoJSONSync(".demo-menu-items.json", items); }
function readDeletedIds(): string[] { return readDemoJSONSync(".demo-deleted-items.json"); }
function writeDeletedIds(ids: string[]) { writeDemoJSONSync(".demo-deleted-items.json", ids); }

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const items = readDemoItems();
  const idx = items.findIndex((i: any) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });

  items[idx] = { ...items[idx], ...body, id: params.id };
  writeDemoItems(items);

  return NextResponse.json({ success: true, data: items[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = readDemoItems();
  const index = items.findIndex((i: any) => i.id === params.id);
  if (index !== -1) {
    items.splice(index, 1);
    writeDemoItems(items);
  } else {
    const deleted = readDeletedIds();
    if (!deleted.includes(params.id)) {
      deleted.push(params.id);
      writeDeletedIds(deleted);
    }
  }
  return NextResponse.json({ success: true, data: { id: params.id } });
}
