import { NextResponse } from "next/server";
import { delDemoJSON } from "@/lib/demo-storage";

export async function POST() {
  try {
    await Promise.all([
      delDemoJSON(".demo-menu-items.json"),
      delDemoJSON(".demo-orders.json"),
      delDemoJSON(".demo-deleted-items.json"),
      delDemoJSON(".demo-reservations.json"),
      delDemoJSON(".demo-butcher-orders.json"),
    ]);
    return NextResponse.json({ success: true, message: "Demo data reset" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to reset" }, { status: 500 });
  }
}
