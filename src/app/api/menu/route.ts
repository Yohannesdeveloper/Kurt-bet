import { NextRequest, NextResponse } from "next/server";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";
import { demoItems, demoCategories, ensureDemoItemsSeeded } from "@/lib/demo-menu-data";

async function readDemoItems(): Promise<any[]> {
  return readDemoJSON(".demo-menu-items.json");
}

async function readDeletedIds(): Promise<string[]> {
  return readDemoJSON(".demo-deleted-items.json");
}

async function writeDemoItems(items: any[]) {
  await writeDemoJSON(".demo-menu-items.json", items);
}

export async function GET(_req: NextRequest) {
    await ensureDemoItemsSeeded();
    const refreshed = await readDemoItems();
    const persistedWithCategory = refreshed.map((pi: any) => ({
      ...pi,
      category: pi.category || { id: pi.categoryId, name: demoCategories.find((c: any) => c.id === pi.categoryId)?.name || "" },
    }));
    const deletedIds = await readDeletedIds();
    const overrideIds = new Set(persistedWithCategory.map((pi: any) => pi.id));
    const merged = demoItems
      .filter((di: any) => !overrideIds.has(di.id))
      .concat(persistedWithCategory);
    const allItems = merged.filter((i: any) => !deletedIds.includes(i.id));

    return NextResponse.json({ success: true, data: { items: allItems, categories: demoCategories } });
}

export async function POST(req: NextRequest) {
  let body: any;
  let demoItem: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  demoItem = {
    id: `demo-mitem-${Date.now()}`,
    name: body.name,
    price: parseFloat(body.price) || 0,
    description: body.description || "",
    image: body.image || "",
    categoryId: body.categoryId,
    category: { id: body.categoryId, name: "" },
    isAvailable: true,
    preparationTime: body.preparationTime || 15,
    variants: [],
    extras: [],
  };

  const persisted = await readDemoItems();
  persisted.push(demoItem);
  await writeDemoItems(persisted);

  return NextResponse.json({ success: true, data: demoItem }, { status: 201 });
}
