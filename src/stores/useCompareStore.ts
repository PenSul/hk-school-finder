import { create } from "zustand";

const MAX_COMPARE = 3;

interface CompareStore {
  selectedIds: string[];
  addSchool: (id: string) => void;
  removeSchool: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareStore>()((set, get) => ({
  selectedIds: [],
  addSchool: (id) =>
    set((s) => {
      if (s.selectedIds.includes(id)) return s;
      if (s.selectedIds.length >= MAX_COMPARE) {
        return { selectedIds: [...s.selectedIds.slice(1), id] };
      }
      return { selectedIds: [...s.selectedIds, id] };
    }),
  removeSchool: (id) =>
    set((s) => ({ selectedIds: s.selectedIds.filter((i) => i !== id) })),
  clearSelection: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
  isFull: () => get().selectedIds.length >= MAX_COMPARE,
}));
