const drinkToInventoryMap = new Map<string, string>([
  ["item-110", "Beer"],
  ["item-111", "Special Beer"],
  ["item-112", "Soft Drink / Ambo Water"],
  ["item-113", "Tekshino"],
  ["item-114", "Acacia White Wine"],
  ["item-115", "Acacia Red Wine"],
  ["item-116", "Rift Valley Wine"],
  ["item-117", "Areke"],
  ["item-118", "Draft Beer"],
  ["item-119", "Jack Master"],
  ["item-120", "Foreign Liquor"],
  ["item-121", "Amarula"],
  ["item-122", "Red Bull"],
  ["item-123", "Tequila"],
  ["item-124", "Sambuca"],
  ["item-125", "Soft Drinks"],
]);

export function getInventoryNameForDrink(menuItemId: string): string | undefined {
  return drinkToInventoryMap.get(menuItemId);
}

export function getAllDrinkToInventoryMappings(): Record<string, string> {
  return Object.fromEntries(drinkToInventoryMap);
}
