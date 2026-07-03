import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-butcher-orders.json";

type ButcherOrderItem = {
  meatType: string;
  portionSize: string;
  quantity: number;
  dish: string; // Purpose of the meat (e.g., "kitfo", "tibs")
};

type ButcherOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerId: string;
  items: ButcherOrderItem[]; // Array of items instead of single fields
  notes: string;
  status: "PENDING" | "WAITER_APPROVED" | "BUTCHER_PREPARING" | "BUTCHER_APPROVED" | "SENT_TO_KITCHEN" | "KITCHEN_RECEIVED" | "REJECTED";
  createdAt: string;
  waiterApprovedAt?: string;
  butcherPreparingAt?: string;
  butcherApprovedAt?: string;
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
    orders = orders.filter((o) => o.status === status);
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
  const { items, notes } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, error: "At least one item is required" }, { status: 400 });
  }

  // Validate each item
  for (const item of items) {
    if (!item.meatType || !item.portionSize || !item.quantity || !item.dish) {
      return NextResponse.json({ success: false, error: "Each item requires meatType, portionSize, quantity, and dish" }, { status: 400 });
    }
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const newOrder: ButcherOrder = {
    id: generateId(),
    orderNumber: getNextNumber(orders),
    customerName: userName,
    customerId: userId,
    items,
    notes: notes || "",
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
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
  }

  const validStatuses = ["PENDING", "WAITER_APPROVED", "BUTCHER_PREPARING", "BUTCHER_APPROVED", "SENT_TO_KITCHEN", "KITCHEN_RECEIVED", "REJECTED"];
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

  // Role-based status transition checks
  if (role === "WAITER" || role === "ADMIN") {
    // Waiter can only approve pending orders
    if (order.status === "PENDING" && status === "WAITER_APPROVED") {
      order.status = status;
      order.waiterApprovedAt = now;
    } else if (order.status === "PENDING" && status === "REJECTED") {
      order.status = status;
      order.rejectedAt = now;
    } else {
      return NextResponse.json({ success: false, error: "Invalid status transition for waiter" }, { status: 400 });
    }
  } else if (role === "BUTCHER" || role === "ADMIN") {
    // Butcher can process orders after waiter approval
    if (order.status === "WAITER_APPROVED" && status === "BUTCHER_PREPARING") {
      order.status = status;
      order.butcherPreparingAt = now;
    } else if (order.status === "BUTCHER_PREPARING" && status === "BUTCHER_APPROVED") {
      order.status = status;
      order.butcherApprovedAt = now;
    } else if (order.status === "BUTCHER_APPROVED" && status === "SENT_TO_KITCHEN") {
      order.status = status;
      order.sentToKitchenAt = now;
    } else if (order.status === "WAITER_APPROVED" && status === "REJECTED") {
      order.status = status;
      order.rejectedAt = now;
    } else {
      return NextResponse.json({ success: false, error: "Invalid status transition for butcher" }, { status: 400 });
    }
  } else if (role === "KITCHEN" || role === "ADMIN") {
    // Kitchen can receive orders
    if (order.status === "SENT_TO_KITCHEN" && status === "KITCHEN_RECEIVED") {
      order.status = status;
      order.receivedAt = now;
    } else {
      return NextResponse.json({ success: false, error: "Invalid status transition for kitchen" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ success: false, error: "Unauthorized role" }, { status: 403 });
  }

  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true, data: orders[index] });
}
