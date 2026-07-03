import { create } from "zustand";
import type { TablePosition } from "@/types";

interface TableStore {
  tables: TablePosition[];
  selectedTable: TablePosition | null;
  floorWidth: number;
  floorHeight: number;
  sections: string[];
  setTables: (tables: TablePosition[]) => void;
  updateTable: (tableId: string, updates: Partial<TablePosition>) => void;
  selectTable: (table: TablePosition | null) => void;
  setFloorSize: (width: number, height: number) => void;
  setSections: (sections: string[]) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  selectedTable: null,
  floorWidth: 1200,
  floorHeight: 800,
  sections: ["Main", "VIP", "Outdoor", "Bar"],
  setTables: (tables) => set({ tables }),
  updateTable: (tableId, updates) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, ...updates } : t
      ),
      selectedTable:
        state.selectedTable?.id === tableId
          ? { ...state.selectedTable, ...updates }
          : state.selectedTable,
    })),
  selectTable: (table) => set({ selectedTable: table }),
  setFloorSize: (width, height) => set({ floorWidth: width, floorHeight: height }),
  setSections: (sections) => set({ sections }),
}));
