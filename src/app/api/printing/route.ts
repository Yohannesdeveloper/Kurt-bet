import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";
import net from "net";

function escposText(text: string): Buffer {
  return Buffer.from(text + "\n");
}

function escposBold(text: string): Buffer {
  return Buffer.concat([
    Buffer.from([0x1b, 0x45, 0x01]),
    Buffer.from(text + "\n"),
    Buffer.from([0x1b, 0x45, 0x00]),
  ]);
}

function escposCenter(text: string): Buffer {
  return Buffer.concat([
    Buffer.from([0x1b, 0x61, 0x01]),
    Buffer.from(text + "\n"),
    Buffer.from([0x1b, 0x61, 0x00]),
  ]);
}

function escposDouble(text: string): Buffer {
  return Buffer.concat([
    Buffer.from([0x1b, 0x21, 0x30]),
    Buffer.from(text + "\n"),
    Buffer.from([0x1b, 0x21, 0x00]),
  ]);
}

function escposCut(): Buffer {
  return Buffer.from([0x1b, 0x6d]);
}

function escposLine(): Buffer {
  return Buffer.from("----------------------\n");
}

function escposNewlines(n: number): Buffer {
  return Buffer.from("\n".repeat(n));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { printerIp, printerPort = 9100, type = "receipt", content } = body;

    if (!printerIp) {
      return NextResponse.json({ success: false, error: "Printer IP required" }, { status: 400 });
    }

    return new Promise<NextResponse>((resolve) => {
      const device = new net.Socket();

      device.connect(printerPort, printerIp, () => {
        let data: Buffer[] = [];

        if (type === "receipt") {
          data.push(escposCenter("RESTAURANT OS"));
          data.push(escposLine());
          data.push(escposText("Item            Qty  Price"));
          data.push(escposLine());

          if (content?.items) {
            content.items.forEach((item: { name: string; quantity: number; totalPrice: number }) => {
              const line = `${item.name.padEnd(16)}${item.quantity.toString().padStart(3)} $${item.totalPrice.toFixed(2).padStart(7)}`;
              data.push(escposText(line));
            });
          }

          data.push(escposLine());
          data.push(escposBold(`Total: $${(content?.total || 0).toFixed(2)}`));
          data.push(escposLine());
          data.push(escposCenter("Thank you!"));
        } else if (type === "kitchen") {
          data.push(escposDouble("KITCHEN ORDER"));
          data.push(escposText(`Table: ${content?.tableNumber || "N/A"}  Order: ${content?.orderNumber || "N/A"}`));
          data.push(escposLine());

          if (content?.items) {
            content.items.forEach((item: { name: string; quantity: number; modifiers?: string[]; notes?: string }) => {
              data.push(escposBold(`${item.quantity}x ${item.name}`));
              if (item.modifiers?.length) {
                item.modifiers.forEach((m: string) => data.push(escposText(`    - ${m}`)));
              }
              if (item.notes) {
                data.push(escposText(`    ** ${item.notes} **`));
              }
            });
          }

          data.push(escposLine());
          data.push(escposText(new Date().toLocaleString()));
        }

        data.push(escposNewlines(4));
        data.push(escposCut());

        device.write(Buffer.concat(data));
        device.end();
      });

      device.on("error", (err: Error) => {
        resolve(NextResponse.json({ success: false, error: `Printer connection failed: ${err.message}` }, { status: 500 }));
      });

      device.on("close", () => {
        resolve(NextResponse.json({ success: true, message: "Printed successfully" }));
      });
    });
  } catch (error) {
    console.error("Print error:", error);
    return NextResponse.json({ success: false, error: "Print failed" }, { status: 500 });
  }
}
