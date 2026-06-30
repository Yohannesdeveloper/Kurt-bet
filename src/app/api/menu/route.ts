import { NextRequest, NextResponse } from "next/server";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

async function readDemoItems(): Promise<any[]> {
  return readDemoJSON(".demo-menu-items.json");
}

async function readDeletedIds(): Promise<string[]> {
  return readDemoJSON(".demo-deleted-items.json");
}

async function writeDemoItems(items: any[]) {
  await writeDemoJSON(".demo-menu-items.json", items);
}

export async function GET(_req: NextRequest) {
  const demoCategories: any[] = [
      { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)", sortOrder: 0, isActive: true },
      { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)", sortOrder: 1, isActive: true },
      { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)", sortOrder: 2, isActive: true },
      { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)", sortOrder: 3, isActive: true },
      { id: "cat-5", name: "መግቢያ (Starters & Sides)", sortOrder: 4, isActive: true },
      { id: "cat-6", name: "ጣፋጭ ምግብ (Desserts)", sortOrder: 5, isActive: true },
      { id: "cat-7", name: "መጠጥ (Beverages)", sortOrder: 6, isActive: true },
    ];
    const demoItems = [
      // ---- Raw Meat ----
      { id: "item-1", name: "Kurt (ኩርት)", price: 350, categoryId: "cat-1", category: { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)" }, description: "Fresh raw beef cubes seasoned with mitmita and niter kibbeh — our signature dish", isAvailable: true, preparationTime: 8, variants: [], extras: [] },
      { id: "item-2", name: "Kitfo (ክትፎ)", price: 300, categoryId: "cat-1", category: { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)" }, description: "Minced raw beef marinated in mitmita, niter kibbeh and cardamom", isAvailable: true, preparationTime: 8, variants: [], extras: [] },
      { id: "item-3", name: "Gored Gored (ጎረድ ጎረድ)", price: 320, categoryId: "cat-1", category: { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)" }, description: "Large cubes of raw beef served with awaze dipping sauce", isAvailable: true, preparationTime: 8, variants: [], extras: [] },
      { id: "item-4", name: "Tere Sega (ጥሬ ሥጋ)", price: 400, categoryId: "cat-1", category: { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)" }, description: "Premium raw beef slices served straight with mitmita and senafich", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-51", name: "Special Kitfo (ስፔሻል ክትፎ)", price: 450, categoryId: "cat-1", category: { id: "cat-1", name: "ጥሬ ሥጋ (Raw Meat)" }, description: "Premium kitfo with extra niter kibbeh, mitmita and cottage cheese on the side", isAvailable: true, preparationTime: 10, variants: [], extras: [] },

      // ---- Cooked Meat ----
      { id: "item-5", name: "Tibs (ጥብስ)", price: 280, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Sautéed beef with onions, jalapeños, tomatoes and rosemary", isAvailable: true, preparationTime: 18, variants: [], extras: [] },
      { id: "item-6", name: "Awaze Tibs (አዋዜ ጥብስ)", price: 300, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Beef tibs simmered in spicy awaze sauce", isAvailable: true, preparationTime: 20, variants: [], extras: [] },
      { id: "item-7", name: "Zilzil Tibs (ዝልዝል ጥብስ)", price: 320, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Thinly sliced beef strips sautéed with garlic and peppers", isAvailable: true, preparationTime: 18, variants: [], extras: [] },
      { id: "item-8", name: "Shekla Tibs (ሸክላ ጥብስ)", price: 380, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Beef tibs served sizzling in a traditional clay pot", isAvailable: true, preparationTime: 25, variants: [], extras: [] },
      { id: "item-9", name: "Dulet (ዱለት)", price: 200, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Minced tripe, liver and beef sautéed with onions and mitmita", isAvailable: true, preparationTime: 15, variants: [], extras: [] },
      { id: "item-10", name: "Lamb Tibs", price: 350, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Tender lamb cubes sautéed with rosemary and garlic", isAvailable: true, preparationTime: 20, variants: [], extras: [] },
      { id: "item-11", name: "Asa Tibs (ዓሣ ጥብስ)", price: 280, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Pan-fried tilapia with onions, tomatoes and herbs", isAvailable: true, preparationTime: 18, variants: [], extras: [] },
      { id: "item-48", name: "Yeheb Gorrod (የሀብ ጎረድ)", price: 380, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Grilled lamb ribs seasoned with Ethiopian spices", isAvailable: true, preparationTime: 25, variants: [], extras: [] },
      { id: "item-52", name: "Beyaynetu (በያይነቱ)", price: 500, categoryId: "cat-2", category: { id: "cat-2", name: "የበሰለ ሥጋ (Cooked Meat)" }, description: "Ethiopian combination platter — sample of tibs, kitfo, doro wat and vegetarian dishes", isAvailable: true, preparationTime: 30, variants: [], extras: [] },

      // ---- Stews & Wot ----
      { id: "item-12", name: "Doro Wat (ዶሮ ወጥ)", price: 250, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Spicy chicken stew slow-cooked with berbere, served with hard-boiled egg", isAvailable: true, preparationTime: 35, variants: [], extras: [] },
      { id: "item-13", name: "Kai Wat (ቀይ ወጥ)", price: 220, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Rich spicy beef stew with berbere and niter kibbeh", isAvailable: true, preparationTime: 30, variants: [], extras: [] },
      { id: "item-14", name: "Minchet Abish (ምንጬ አብሽ)", price: 200, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Minced beef stew simmered with berbere and seasoned butter", isAvailable: true, preparationTime: 25, variants: [], extras: [] },
      { id: "item-15", name: "Alicha Wat (አሊጫ ወጥ)", price: 200, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Mild turmeric-based beef or lamb stew with potatoes and carrots", isAvailable: true, preparationTime: 25, variants: [], extras: [] },
      { id: "item-16", name: "Sega Wat (ሥጋ ወጥ)", price: 260, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Hearty lamb or beef chunks in traditional spiced sauce", isAvailable: true, preparationTime: 35, variants: [], extras: [] },
      { id: "item-17", name: "Gomen Besega (ጎመን በሥጋ)", price: 220, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Collard greens cooked with beef chunks and spices", isAvailable: true, preparationTime: 25, variants: [], extras: [] },
      { id: "item-49", name: "Beg Wat (በግ ወጥ)", price: 280, categoryId: "cat-3", category: { id: "cat-3", name: "ሾርባ እና ወጥ (Stews & Wot)" }, description: "Slow-cooked lamb stew in rich berbere sauce", isAvailable: true, preparationTime: 35, variants: [], extras: [] },

      // ---- Vegetarian ----
      { id: "item-18", name: "Shiro (ሽሮ)", price: 150, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Smooth chickpea or lentil stew slow-cooked with berbere", isAvailable: true, preparationTime: 20, variants: [], extras: [] },
      { id: "item-19", name: "Misir Wat (ምስር ወጥ)", price: 150, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Red lentil stew in spicy berbere sauce", isAvailable: true, preparationTime: 22, variants: [], extras: [] },
      { id: "item-20", name: "Atkilt Wat (አትክልት ወጥ)", price: 130, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Mixed vegetable stew with carrots, potatoes and green beans", isAvailable: true, preparationTime: 18, variants: [], extras: [] },
      { id: "item-21", name: "Gomen (ጎመን)", price: 120, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Sautéed collard greens with garlic and ginger", isAvailable: true, preparationTime: 15, variants: [], extras: [] },
      { id: "item-22", name: "Buticha (ቡቲቻ)", price: 120, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Chickpea salad with lemon, onions and green peppers", isAvailable: true, preparationTime: 8, variants: [], extras: [] },
      { id: "item-53", name: "Timatim Fitfit (ቲማቲም ፍትፍት)", price: 130, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Shredded injera with fresh tomatoes, onions and lemon dressing", isAvailable: true, preparationTime: 8, variants: [], extras: [] },
      { id: "item-54", name: "Fosolia (ፎሶሊያ)", price: 120, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Green beans and carrots sautéed with onions and garlic", isAvailable: true, preparationTime: 15, variants: [], extras: [] },
      { id: "item-55", name: "Tikil Gomen (ጥቅል ጎመን)", price: 120, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Sautéed cabbage, carrots and potatoes with turmeric", isAvailable: true, preparationTime: 18, variants: [], extras: [] },
      { id: "item-56", name: "Dinich Wat (ድንች ወጥ)", price: 150, categoryId: "cat-4", category: { id: "cat-4", name: "ከሠጋ ነፃ (Vegetarian)" }, description: "Potato stew in mild spiced sauce", isAvailable: true, preparationTime: 22, variants: [], extras: [] },

      // ---- Starters & Sides ----
      { id: "item-23", name: "Sambusa (ሳምቡሳ)", price: 100, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Crispy pastry filled with spiced minced meat — 3 pieces", isAvailable: true, preparationTime: 12, variants: [], extras: [] },
      { id: "item-24", name: "Lentil Sambusa", price: 80, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Crispy pastry filled with spiced red lentils — 3 pieces", isAvailable: true, preparationTime: 12, variants: [], extras: [] },
      { id: "item-25", name: "Kolo (ቆሎ)", price: 60, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Roasted barley with peanuts and spices", isAvailable: true, preparationTime: 3, variants: [], extras: [] },
      { id: "item-26", name: "Injera (extra)", price: 30, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Extra injera on the side", isAvailable: true, preparationTime: 2, variants: [], extras: [] },
      { id: "item-27", name: "Dabo (ዳቦ)", price: 50, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Traditional Ethiopian bread baked in a clay oven", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-28", name: "Enkulal Firfir (እንቁላል ፍርፍር)", price: 150, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Shredded injera with scrambled eggs and berbere sauce", isAvailable: true, preparationTime: 10, variants: [], extras: [] },
      { id: "item-29", name: "Firfir (ፍርፍር)", price: 160, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Shredded injera tossed in spicy berbere sauce", isAvailable: true, preparationTime: 10, variants: [], extras: [] },
      { id: "item-45", name: "Chechebsa (ጨጨብሳ)", price: 130, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Shredded flatbread sautéed in spiced butter and berbere", isAvailable: true, preparationTime: 12, variants: [], extras: [] },
      { id: "item-46", name: "Genfo (ገንፎ)", price: 100, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Thick roasted barley porridge served with niter kibbeh and berbere", isAvailable: true, preparationTime: 15, variants: [], extras: [] },
      { id: "item-47", name: "Kicha (ቅቻ)", price: 80, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Ethiopian-style flatbread baked on a griddle", isAvailable: true, preparationTime: 10, variants: [], extras: [] },
      { id: "item-50", name: "Dorho Fitfit (ዶሮ ፍትፍት)", price: 180, categoryId: "cat-5", category: { id: "cat-5", name: "መግቢያ (Starters & Sides)" }, description: "Shredded injera with chicken and berbere sauce", isAvailable: true, preparationTime: 12, variants: [], extras: [] },

      // ---- Desserts ----
      { id: "item-30", name: "Atayef (አታይፍ)", price: 150, categoryId: "cat-6", category: { id: "cat-6", name: "ጣፋጭ ምግብ (Desserts)" }, description: "Stuffed pancakes with cream, nuts and sweet syrup", isAvailable: true, preparationTime: 15, variants: [], extras: [] },
      { id: "item-31", name: "Ethiopian Cheesecake", price: 180, categoryId: "cat-6", category: { id: "cat-6", name: "ጣፋጭ ምግብ (Desserts)" }, description: "Creamy cheesecake with a touch of honey and cardamom", isAvailable: true, preparationTime: 10, variants: [], extras: [] },
      { id: "item-32", name: "Halwa", price: 100, categoryId: "cat-6", category: { id: "cat-6", name: "ጣፋጭ ምግብ (Desserts)" }, description: "Traditional sesame-based sweet with cardamom", isAvailable: true, preparationTime: 3, variants: [], extras: [] },

      // ---- Beverages ----
      { id: "item-33", name: "Ethiopian Coffee (ቡና)", price: 70, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Traditional coffee ceremony style — freshly roasted and brewed", isAvailable: true, preparationTime: 12, variants: [], extras: [] },
      { id: "item-34", name: "Macchiato", price: 60, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Ethiopian-style macchiato with thick espresso", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-35", name: "Tej (ጠጅ)", price: 150, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Traditional Ethiopian honey wine", isAvailable: true, preparationTime: 2, variants: [], extras: [] },
      { id: "item-36", name: "Tella (ጠላ)", price: 80, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Traditional homemade Ethiopian beer", isAvailable: true, preparationTime: 2, variants: [], extras: [] },
      { id: "item-37", name: "Spiced Tea (ሻይ)", price: 50, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Ethiopian chai with cinnamon, cardamom and cloves", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-38", name: "Spris (ስፕሪስ)", price: 120, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Layered fresh juice with mango, avocado and papaya", isAvailable: true, preparationTime: 7, variants: [], extras: [] },
      { id: "item-39", name: "Avocado Juice", price: 100, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Creamy fresh avocado blended with milk and sugar", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-40", name: "Mango Juice", price: 80, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Fresh Ethiopian mango juice", isAvailable: true, preparationTime: 3, variants: [], extras: [] },
      { id: "item-41", name: "Ambo (አምቦ)", price: 40, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Ethiopian sparkling mineral water", isAvailable: true, preparationTime: 1, variants: [], extras: [] },
      { id: "item-42", name: "Soft Drinks", price: 50, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Coca Cola, Fanta Orange, Sprite", isAvailable: true, preparationTime: 1, variants: [], extras: [] },
      { id: "item-43", name: "Besso (በሶ)", price: 50, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Roasted barley drink — traditional and refreshing", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
      { id: "item-44", name: "Atmet (አጥሜት)", price: 50, categoryId: "cat-7", category: { id: "cat-7", name: "መጠጥ (Beverages)" }, description: "Toasted barley flour drink with spices", isAvailable: true, preparationTime: 5, variants: [], extras: [] },
    ];
    const persistedItems = await readDemoItems();
    if (persistedItems.length === 0) {
      await writeDemoItems(demoItems.map((di: any) => ({ ...di })));
    }
    const persistedWithCategory = persistedItems.map((pi: any) => ({
      ...pi,
      category: pi.category || { id: pi.categoryId, name: demoCategories.find((c: any) => c.id === pi.categoryId)?.name || "" },
    }));
    const deletedIds = await readDeletedIds();
    const overrideIds = new Set(persistedWithCategory.map((pi: any) => pi.id));
    const merged = demoItems
      .filter((di: any) => !overrideIds.has(di.id))
      .concat(persistedWithCategory);
    const allItems = merged.filter((i: any) => !deletedIds.includes(i.id));

    return NextResponse.json({ success: true, data: { items: allItems, categories: demoCategories } });
}

export async function POST(req: NextRequest) {
  let body: any;
  let demoItem: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  demoItem = {
    id: `demo-mitem-${Date.now()}`,
    name: body.name,
    price: parseFloat(body.price) || 0,
    description: body.description || "",
    image: body.image || "",
    categoryId: body.categoryId,
    category: { id: body.categoryId, name: "" },
    isAvailable: true,
    preparationTime: body.preparationTime || 15,
    variants: [],
    extras: [],
  };

  const persisted = await readDemoItems();
  persisted.push(demoItem);
  await writeDemoItems(persisted);

  return NextResponse.json({ success: true, data: demoItem }, { status: 201 });
}
