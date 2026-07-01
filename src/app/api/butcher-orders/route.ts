import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-butcher-orders.json";

type ButcherOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerId: string;
  meatType: string;
  portionSize: string;
  quantity: number;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SENT_TO_KITCHEN";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  sentToKitchenAt?: string;
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getNextNumber(orders: ButcherOrder[]): number {
  if (orders.length === 0) return 1001;
  return Math.max(...orders.map((o) => o.orderNumber)) + 1;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { meatType, portionSize, quantity, notes } = body;

  if (!meatType || !portionSize || !quantity) {
    return NextResponse.json({ success: false, error: "meatType, portionSize, and quantity are required" }, { status: 400 });
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const newOrder: ButcherOrder = {
    id: generateId(),
    orderNumber: getNextNumber(orders),
    customerName: (session.user as { name?: string }).name || "Unknown",
    customerId: (session.user as { id?: string }).id || "",
    meatType,
    portionSize,
    quantity,
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
  if (role !== "ADMIN" && role !== "BUTCHER") {
    return NextResponse.json({ success: false, error: "Butcher or Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
  }

  if (!["APPROVED", "REJECTED", "SENT_TO_KITCHEN"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const orders = await readDemoJSON<ButcherOrder>(DEMO_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  orders[index].status = status;
  if (status === "APPROVED") orders[index].approvedAt = now;
  if (status === "REJECTED") orders[index].rejectedAt = now;
  if (status === "SENT_TO_KITCHEN") orders[index].sentToKitchenAt = now;

  await writeDemoJSON(DEMO_FILE, orders);
  return NextResponse.json({ success: true, data: orders[index] });
}
