import { create } from "zustand";
import type { EducationLevel } from "@/types/filter";

interface FilterStore {
  educationLevel: EducationLevel;
  searchQuery: string;
  districts: string[];
  financeTypes: string[];
  religions: string[];
  sessions: string[];
  genders: string[];
  setEducationLevel: (level: EducationLevel) => void;
  setSearchQuery: (query: string) => void;
  toggleDistrict: (district: string) => void;
  toggleFinanceType: (type: string) => void;
  toggleReligion: (religion: string) => void;
  toggleSession: (session: string) => void;
  toggleGender: (gender: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULT_STATE = {
  educationLevel: "PRIMARY" as EducationLevel,
  searchQuery: "",
  districts: [] as string[],
  financeTypes: [] as string[],
  religions: [] as string[],
  sessions: [] as string[],
  genders: [] as string[],
};

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export const useFilterStore = create<FilterStore>()((set, get) => ({
  ...DEFAULT_STATE,
  setEducationLevel: (level) =>
    set({ educationLevel: level, ...stripFilters() }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleDistrict: (d) => set((s) => ({ districts: toggleItem(s.districts, d) })),
  toggleFinanceType: (t) =>
    set((s) => ({ financeTypes: toggleItem(s.financeTypes, t) })),
  toggleReligion: (r) =>
    set((s) => ({ religions: toggleItem(s.religions, r) })),
  toggleSession: (s) =>
    set((state) => ({ sessions: toggleItem(state.sessions, s) })),
  toggleGender: (g) => set((s) => ({ genders: toggleItem(s.genders, g) })),
  clearFilters: () => set(stripFilters()),
  hasActiveFilters: () => {
    const s = get();
    return (
      s.searchQuery.trim().length > 0 ||
      s.districts.length > 0 ||
      s.financeTypes.length > 0 ||
      s.religions.length > 0 ||
      s.sessions.length > 0 ||
      s.genders.length > 0
    );
  },
}));

function stripFilters() {
  return {
    searchQuery: "",
    districts: [] as string[],
    financeTypes: [] as string[],
    religions: [] as string[],
    sessions: [] as string[],
    genders: [] as string[],
  };
}
