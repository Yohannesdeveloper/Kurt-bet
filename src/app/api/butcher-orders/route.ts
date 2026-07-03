import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-butcher-orders.json";

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  customerId: string;
  meatType: string;
  menuItemName: string;
  weight: number;
  quantity: number;
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  kitchenStatus: "WAITING" | "RECEIVED";
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
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
  const { meatType, menuItemName, weight, quantity, notes, tableNumber, orderId } = body;

  if (!menuItemName || !quantity || quantity < 1) {
    return NextResponse.json({ success: false, error: "menuItemName and quantity (>=1) are required" }, { status: 400 });
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const newOrder: ButcherOrder = {
    id: generateId(),
    orderNumber: getNextNumber(orders),
    orderId: orderId || undefined,
    customerName: userName,
    customerId: userId,
    meatType: meatType || "Beef",
    menuItemName,
    weight: parseFloat(weight) || 1,
    quantity: parseInt(quantity) || 1,
    tableNumber: tableNumber || null,
    notes: notes || "",
    status: "PENDING",
    kitchenStatus: "WAITING",
    createdAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
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
  const { id, status, kitchenStatus } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  const order = orders[index];
  const now = new Date().toISOString();

  if (kitchenStatus && (role === "KITCHEN" || role === "ADMIN")) {
    if (order.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "Only approved orders can be received by kitchen" }, { status: 400 });
    }
    if (!["WAITING", "RECEIVED"].includes(kitchenStatus)) {
      return NextResponse.json({ success: false, error: "Invalid kitchenStatus" }, { status: 400 });
    }
    order.kitchenStatus = kitchenStatus;
  } else if (order.status === "PENDING" && status === "APPROVED") {
    if (role !== "BUTCHER" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Only butchers can approve" }, { status: 403 });
    }
    order.status = "APPROVED";
    order.approvedAt = now;
  } else if (order.status === "PENDING" && status === "REJECTED") {
    if (role !== "BUTCHER" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Only butchers can reject" }, { status: 403 });
    }
    order.status = "REJECTED";
    order.rejectedAt = now;
  } else {
    return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 });
  }

  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true, data: orders[index] });
}
