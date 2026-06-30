import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";
import { readDemoJSONSync, writeDemoJSONSync } from "@/lib/demo-storage";

function readDemoItems(): any[] { return readDemoJSONSync(".demo-menu-items.json"); }
function writeDemoItems(items: any[]) { writeDemoJSONSync(".demo-menu-items.json", items); }
function readDeletedIds(): string[] { return readDemoJSONSync(".demo-deleted-items.json"); }
function writeDeletedIds(ids: string[]) { writeDemoJSONSync(".demo-deleted-items.json", ids); }

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        cost: body.cost,
        categoryId: body.categoryId,
        isActive: body.isActive,
        isAvailable: body.isAvailable,
        preparationTime: body.preparationTime,
        image: body.image,
        sortOrder: body.sortOrder,
      },
      include: { category: true, variants: true, extras: true },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Menu item update error (trying demo):", error);
    if (!body) return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    const items = readDemoItems();
    const idx = items.findIndex((i: any) => i.id === params.id);
    const override = { ...body, id: params.id };
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...body };
    } else {
      items.push(override);
    }
    writeDemoItems(items);
    return NextResponse.json({ success: true, data: override });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    await prisma.menuItem.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    console.error("Menu item delete error, trying demo:", error);
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
}