import { NextRequest, NextResponse } from "next/server";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";
import { demoInventoryItems } from "@/lib/demo-inventory-data";

const DEMO_FILE = ".demo-inventory.json";

function generateId(): string {
  return "inv-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

export async function GET() {
  let items = await readDemoJSON<InventoryItem>(DEMO_FILE);
  if (items.length === 0) {
    await writeDemoJSON(DEMO_FILE, demoInventoryItems);
    items = demoInventoryItems;
  }
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, quantity, unit, category } = body;

  if (!name || quantity === undefined || !unit || !category) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const items = await readDemoJSON<InventoryItem>(DEMO_FILE);
  const newItem: InventoryItem = {
    id: id || generateId(),
    name,
    quantity: parseFloat(quantity) || 0,
    unit,
    category,
  };

  if (items.some((i) => i.id === newItem.id)) {
    return NextResponse.json({ success: false, error: "Item ID already exists" }, { status: 409 });
  }

  items.push(newItem);
  await writeDemoJSON(DEMO_FILE, items);
  return NextResponse.json({ success: true, data: newItem }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, quantity, name, unit, category } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  const items = await readDemoJSON<InventoryItem>(DEMO_FILE);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
  }

  if (name !== undefined) {
    items[index].name = name;
    items[index].quantity = parseFloat(quantity) ?? items[index].quantity;
    items[index].unit = unit ?? items[index].unit;
    items[index].category = category ?? items[index].category;
  } else if (quantity !== undefined) {
    items[index].quantity = Math.max(0, items[index].quantity + parseFloat(quantity));
  }

  await writeDemoJSON(DEMO_FILE, items);
  return NextResponse.json({ success: true, data: items[index] });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  const items = await readDemoJSON<InventoryItem>(DEMO_FILE);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
  }

  items.splice(index, 1);
  await writeDemoJSON(DEMO_FILE, items);
  return NextResponse.json({ success: true });
}
