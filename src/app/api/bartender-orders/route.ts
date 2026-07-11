import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";
import { getInventoryNameForDrink } from "@/lib/drink-inventory-map";

const DEMO_FILE = ".demo-bartender-orders.json";

type BartenderOrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type BartenderOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  items: BartenderOrderItem[];
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  createdAt: string;
  completedAt: string | null;
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getNextNumber(orders: BartenderOrder[]): number {
  if (orders.length === 0) return 2001;
  return Math.max(...orders.map((o) => o.orderNumber)) + 1;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  let orders = await readDemoJSON<BartenderOrder>(DEMO_FILE);
  if (status && status !== "all") {
    const statuses = status.split(",");
    orders = orders.filter((o) => statuses.includes(o.status));
  }
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: NextRequest) {
  let session: any = null;
  try { session = await getServerSession(authOptions); } catch {}
  const userId = (session?.user as { id?: string })?.id || "anonymous";
  const userName = (session?.user as { name?: string })?.name || "Unknown";

  const body = await req.json();
  const { items, notes, tableNumber, orderId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, error: "items array is required" }, { status: 400 });
  }

  const orders = await readDemoJSON<BartenderOrder>(DEMO_FILE);
  const newOrder: BartenderOrder = {
    id: generateId(),
    orderNumber: getNextNumber(orders),
    orderId: orderId || undefined,
    customerName: userName,
    items: items.map((item: any) => ({
      menuItemId: item.menuItemId || "",
      name: item.name,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
    })),
    tableNumber: tableNumber || null,
    notes: notes || "",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  orders.push(newOrder);
  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  if (!status || !["PENDING", "PREPARING", "READY", "SERVED"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const orders = await readDemoJSON<BartenderOrder>(DEMO_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  const validTransitions: Record<string, string[]> = {
    PENDING: ["PREPARING"],
    PREPARING: ["READY"],
    READY: ["SERVED"],
    SERVED: [],
  };

  const order = orders[index];
  if (!validTransitions[order.status]?.includes(status)) {
    return NextResponse.json({ success: false, error: `Cannot transition from ${order.status} to ${status}` }, { status: 400 });
  }

  order.status = status;
  if (status === "SERVED") order.completedAt = new Date().toISOString();
  await writeDemoJSON(DEMO_FILE, orders);

  // Deduct inventory when drink order is READY (bartender takes the bottle off the shelf)
  if (status === "READY") {
    try {
      const INVENTORY_FILE = ".demo-inventory.json";
      const inventory = await readDemoJSON<any>(INVENTORY_FILE);
      let changed = false;
      for (const item of order.items) {
        const invName = getInventoryNameForDrink(item.menuItemId);
        if (invName) {
          const invIdx = inventory.findIndex((inv: any) => inv.name === invName);
          if (invIdx >= 0) {
            inventory[invIdx].quantity = Math.max(0, inventory[invIdx].quantity - item.quantity);
            changed = true;
          }
        }
      }
      if (changed) {
        await writeDemoJSON(INVENTORY_FILE, inventory);
      }
    } catch (err) {
      console.error("Failed to deduct inventory:", err);
    }
  }

  return NextResponse.json({ success: true, data: orders[index] });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Only admins can delete" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  const orders = await readDemoJSON<BartenderOrder>(DEMO_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  orders.splice(index, 1);
  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true });
}
