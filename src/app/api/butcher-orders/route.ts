import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-butcher-orders.json";

type ButcherOrderItem = {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  dish: string;
};

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  tableNumber?: string;
  customerName: string;
  customerId: string;
  items: ButcherOrderItem[];
  preparationNotes: string;
  meatWeightKg?: number;
  status: "PENDING" | "SENT_TO_KITCHEN" | "KITCHEN_RECEIVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
  sentToKitchenAt?: string;
  receivedAt?: string;
  rejectedAt?: string;
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getNextNumber(orders: ButcherOrder[]): number {
  if (orders.length === 0) return 1001;
  return Math.max(...orders.map((o) => o.orderNumber)) + 1;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  let orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
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
  const { items, preparationNotes, orderId, tableNumber } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, error: "At least one item is required" }, { status: 400 });
  }

  for (const item of items) {
    if (!item.menuItemId || !item.menuItemName || !item.quantity) {
      return NextResponse.json({ success: false, error: "Each item requires menuItemId, menuItemName, and quantity" }, { status: 400 });
    }
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const newOrder: ButcherOrder = {
    id: generateId(),
    orderNumber: getNextNumber(orders),
    orderId: orderId || undefined,
    tableNumber: tableNumber || undefined,
    customerName: userName,
    customerId: userId,
    items: items.map((item: any) => ({
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      dish: item.dish || "",
    })),
    preparationNotes: preparationNotes || "",
    status: "PENDING",
    createdAt: new Date().toISOString(),
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

  const role = (session.user as { role?: string }).role;
  const body = await req.json();
  const { id, status, preparationNotes, meatWeightKg } = body;

  if (!id || !status) {
    return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
  }

  const validStatuses = ["PENDING", "SENT_TO_KITCHEN", "KITCHEN_RECEIVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  const order = orders[index];
  const now = new Date().toISOString();

  if (role === "BUTCHER" || role === "ADMIN") {
    if (order.status === "PENDING" && status === "SENT_TO_KITCHEN") {
      order.status = status;
      order.sentToKitchenAt = now;
      order.approvedAt = now;
      if (meatWeightKg !== undefined) order.meatWeightKg = meatWeightKg;
      if (preparationNotes !== undefined) order.preparationNotes = preparationNotes;
    } else if (order.status === "PENDING" && status === "REJECTED") {
      order.status = status;
      order.rejectedAt = now;
    } else {
      return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 });
    }
  } else if (role === "KITCHEN" || role === "ADMIN") {
    if (order.status === "SENT_TO_KITCHEN" && status === "KITCHEN_RECEIVED") {
      order.status = status;
      order.receivedAt = now;
    } else {
      return NextResponse.json({ success: false, error: "Invalid status transition for kitchen" }, { status: 400 });
    }
  } else if (role === "WAITER" && order.status === "PENDING" && status === "REJECTED") {
    order.status = status;
    order.rejectedAt = now;
  } else {
    return NextResponse.json({ success: false, error: "Unauthorized role or invalid transition" }, { status: 403 });
  }

  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true, data: orders[index] });
}
