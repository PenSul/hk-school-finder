import { create } from "zustand";

interface UniFilterStore {
  scope: "UGC" | "ALL";
  studyLevels: string[];
  modesOfStudy: string[];
  programmeSearch: string;
  districts: string[];
  setScope: (scope: "UGC" | "ALL") => void;
  toggleStudyLevel: (level: string) => void;
  toggleModeOfStudy: (mode: string) => void;
  setProgrammeSearch: (query: string) => void;
  toggleDistrict: (district: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export const useUniFilterStore = create<UniFilterStore>()((set, get) => ({
  scope: "UGC",
  studyLevels: [],
  modesOfStudy: [],
  programmeSearch: "",
  districts: [],
  setScope: (scope) =>
    set({ scope, studyLevels: [], modesOfStudy: [], programmeSearch: "" }),
  toggleStudyLevel: (l) =>
    set((s) => ({ studyLevels: toggleItem(s.studyLevels, l) })),
  toggleModeOfStudy: (m) =>
    set((s) => ({ modesOfStudy: toggleItem(s.modesOfStudy, m) })),
  setProgrammeSearch: (query) => set({ programmeSearch: query }),
  toggleDistrict: (d) =>
    set((s) => ({ districts: toggleItem(s.districts, d) })),
  clearFilters: () =>
    set({ studyLevels: [], modesOfStudy: [], programmeSearch: "", districts: [] }),
  hasActiveFilters: () => {
    const s = get();
    return (
      s.studyLevels.length > 0 ||
      s.modesOfStudy.length > 0 ||
      s.programmeSearch.trim().length > 0 ||
      s.districts.length > 0
    );
  },
}));
