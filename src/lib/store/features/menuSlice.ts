import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  parentId?: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  category: { id: string; name: string };
  isAvailable: boolean;
  preparationTime: number;
  image?: string;
}

interface MenuState {
  items: MenuItem[];
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
};

export const fetchMenu = createAsyncThunk("menu/fetchMenu", async () => {
  const res = await fetch("/api/menu");
  const d = await res.json();
  if (!d.success) throw new Error(d.error || "Failed to fetch menu");
  return { items: d.data.items as MenuItem[], categories: d.data.categories as MenuCategory[] };
});

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    optimisticToggleAvailability(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.isAvailable = !item.isAvailable;
    },
    addItem(state, action: PayloadAction<MenuItem>) {
      state.items.push(action.payload);
    },
    updateItem(state, action: PayloadAction<MenuItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    revertItem(state, action: PayloadAction<MenuItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.categories = action.payload.categories;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch menu";
      });
  },
});

export const {
  optimisticToggleAvailability,
  addItem,
  updateItem,
  removeItem,
  revertItem,
  setLoading,
} = menuSlice.actions;

export default menuSlice.reducer;
