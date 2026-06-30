import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DEMO_MENU_FILE = path.join(process.cwd(), ".demo-menu-items.json");
const DEMO_DELETED_FILE = path.join(process.cwd(), ".demo-deleted-items.json");

function readDemoItems(): any[] {
  try {
    if (fs.existsSync(DEMO_MENU_FILE)) {
      return JSON.parse(fs.readFileSync(DEMO_MENU_FILE, "utf-8"));
    }
  } catch { /* ignore */ }
  return [];
}

function writeDemoItems(items: any[]) {
  try {
    fs.writeFileSync(DEMO_MENU_FILE, JSON.stringify(items, null, 2));
  } catch { /* ignore */ }
}

function readDeletedIds(): string[] {
  try {
    if (fs.existsSync(DEMO_DELETED_FILE)) {
      return JSON.parse(fs.readFileSync(DEMO_DELETED_FILE, "utf-8"));
    }
  } catch { /* ignore */ }
  return [];
}

function writeDeletedIds(ids: string[]) {
  try {
    fs.writeFileSync(DEMO_DELETED_FILE, JSON.stringify(ids, null, 2));
  } catch { /* ignore */ }
}

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