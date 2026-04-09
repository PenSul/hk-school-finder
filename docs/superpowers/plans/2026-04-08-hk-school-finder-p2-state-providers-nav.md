# HK School Finder - Plan 2: State Management, Providers & Navigation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the state management layer (Zustand stores with MMKV persistence), context providers (Theme, Language, Database), data access hooks, i18n translations, and the complete Expo Router navigation structure with 5-tab bottom nav and stack routes.

**Architecture:** Zustand stores manage filter, comparison, and shortlist state. MMKV persists user preferences (theme, language) and shortlist/status data. Three React Context providers gate the app: DatabaseProvider seeds data on first launch, ThemeProvider handles light/dark/system mode, LanguageProvider enables EN/TC switching. Expo Router file-based routing defines a 5-tab bottom navigator with stack screens for detail views.

**Tech Stack:** Zustand v5, react-native-mmkv, @tanstack/react-query, expo-sqlite (SQLiteProvider + useSQLiteContext), expo-router (Tabs + Stack), expo-localization, expo-font, expo-splash-screen, NativeWind v4

**Spec Reference:** `docs/superpowers/specs/2026-04-08-hk-school-finder-design.md` (Sections 3.2, 4, 5, 6.2, 6.3)

**Depends on:** Plan 1 (Foundation & Data Layer) -- all types, constants, DB schema, repositories, parsers, and seed logic.

---

## File Structure (this plan creates)

```
src/
  stores/
    mmkv.ts                    -- shared MMKV instance + Zustand storage adapter
    useFilterStore.ts          -- K-12 filter state (Zustand, non-persisted)
    useUniFilterStore.ts       -- university filter state (Zustand, non-persisted)
    useCompareStore.ts         -- comparison selections (Zustand, non-persisted)
    useShortlistStore.ts       -- shortlist IDs (Zustand + MMKV)
    useStatusTrackerStore.ts   -- application stages (Zustand + MMKV)
  providers/
    DatabaseProvider.tsx       -- seed gate + loading/error screens
    ThemeProvider.tsx           -- light/dark/system with MMKV
    LanguageProvider.tsx        -- EN/TC with i18n JSON + MMKV
  hooks/
    useSchools.ts              -- filtered school list from repo
    useInstitutions.ts         -- filtered HEI list
    useProgrammes.ts           -- filtered programme list
    useSchoolCount.ts          -- debounced COUNT query
    useCalendarEvents.ts       -- events by month
    useNetworkStatus.ts        -- NetInfo wrapper
  i18n/
    en.json                    -- English translations
    tc.json                    -- Traditional Chinese translations
app/
  _layout.tsx                  -- root layout with all providers
  (tabs)/
    _layout.tsx                -- 5-tab bottom navigator
    discover/index.tsx         -- placeholder
    map/index.tsx              -- placeholder
    shortlist/index.tsx        -- placeholder
    calendar/index.tsx         -- placeholder
    settings/index.tsx         -- placeholder
  school/[id].tsx              -- placeholder detail
  institution/[id].tsx         -- placeholder detail
  compare/index.tsx            -- placeholder
  event/[id].tsx               -- placeholder detail
  event/create.tsx             -- placeholder
```

---

### Task 1: MMKV Storage Instance

**Files:**
- Create: `src/stores/mmkv.ts`

- [ ] **Step 1: Create src/stores/mmkv.ts**

```ts
import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const storage = new MMKV();

/**
 * Zustand-compatible storage adapter for MMKV.
 * Used with createJSONStorage(() => mmkvStateStorage) in persist middleware.
 */
export const mmkvStateStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/mmkv.ts
git commit -m "feat: add shared MMKV instance and Zustand storage adapter"
```

---

### Task 2: Non-Persisted Zustand Stores

**Files:**
- Create: `src/stores/useFilterStore.ts`
- Create: `src/stores/useUniFilterStore.ts`
- Create: `src/stores/useCompareStore.ts`

- [ ] **Step 1: Create src/stores/useFilterStore.ts**

```ts
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
```

- [ ] **Step 2: Create src/stores/useUniFilterStore.ts**

```ts
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
```

- [ ] **Step 3: Create src/stores/useCompareStore.ts**

```ts
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/useFilterStore.ts src/stores/useUniFilterStore.ts src/stores/useCompareStore.ts
git commit -m "feat: add Zustand stores for K-12 filters, university filters, and comparison"
```

---

### Task 3: Persisted Zustand Stores

**Files:**
- Create: `src/stores/useShortlistStore.ts`
- Create: `src/stores/useStatusTrackerStore.ts`

- [ ] **Step 1: Create src/stores/useShortlistStore.ts**

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStateStorage } from "./mmkv";

interface ShortlistStore {
  shortlistedIds: string[];
  addToShortlist: (id: string) => void;
  removeFromShortlist: (id: string) => void;
  isShortlisted: (id: string) => boolean;
  clearShortlist: () => void;
}

export const useShortlistStore = create<ShortlistStore>()(
  persist(
    (set, get) => ({
      shortlistedIds: [],
      addToShortlist: (id) =>
        set((s) => {
          if (s.shortlistedIds.includes(id)) return s;
          return { shortlistedIds: [...s.shortlistedIds, id] };
        }),
      removeFromShortlist: (id) =>
        set((s) => ({
          shortlistedIds: s.shortlistedIds.filter((i) => i !== id),
        })),
      isShortlisted: (id) => get().shortlistedIds.includes(id),
      clearShortlist: () => set({ shortlistedIds: [] }),
    }),
    {
      name: "shortlist-storage",
      storage: createJSONStorage(() => mmkvStateStorage),
    }
  )
);
```

- [ ] **Step 2: Create src/stores/useStatusTrackerStore.ts**

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStateStorage } from "./mmkv";

export type ApplicationStage =
  | "interested"
  | "visited"
  | "applied"
  | "result";

interface StatusTrackerStore {
  stages: Record<string, ApplicationStage>;
  setStage: (schoolId: string, stage: ApplicationStage) => void;
  getStage: (schoolId: string) => ApplicationStage | undefined;
  removeStage: (schoolId: string) => void;
  clearStages: () => void;
}

export const useStatusTrackerStore = create<StatusTrackerStore>()(
  persist(
    (set, get) => ({
      stages: {},
      setStage: (schoolId, stage) =>
        set((s) => ({ stages: { ...s.stages, [schoolId]: stage } })),
      getStage: (schoolId) => get().stages[schoolId],
      removeStage: (schoolId) =>
        set((s) => {
          const { [schoolId]: _, ...rest } = s.stages;
          return { stages: rest };
        }),
      clearStages: () => set({ stages: {} }),
    }),
    {
      name: "status-tracker-storage",
      storage: createJSONStorage(() => mmkvStateStorage),
    }
  )
);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/useShortlistStore.ts src/stores/useStatusTrackerStore.ts
git commit -m "feat: add MMKV-persisted Zustand stores for shortlist and status tracker"
```

---

### Task 4: i18n Translation Files

**Files:**
- Create: `src/i18n/en.json`
- Create: `src/i18n/tc.json`

- [ ] **Step 1: Create src/i18n/en.json**

```json
{
  "app_name": "HK School Finder",
  "tab_discover": "Discover",
  "tab_map": "Map",
  "tab_shortlist": "Shortlist",
  "tab_calendar": "Calendar",
  "tab_settings": "Settings",
  "loading": "Loading...",
  "seeding_schools": "Downloading school data...",
  "seeding_hei": "Downloading institution data...",
  "seeding_ugc": "Downloading programme data...",
  "seeding_saving": "Saving data...",
  "seed_complete": "Data loaded successfully",
  "seed_error": "Failed to load data",
  "seed_retry": "Tap to retry",
  "seed_offline": "Connect to the internet to download school data",
  "no_results": "No results found",
  "screen_school_detail": "School Detail",
  "screen_institution_detail": "Institution Detail",
  "screen_compare": "Compare Schools",
  "screen_event_detail": "Event Detail",
  "screen_create_event": "New Event",
  "education_kg": "KG",
  "education_primary": "Primary",
  "education_secondary": "Secondary",
  "education_university": "University",
  "placeholder_coming_soon": "Coming soon",
  "shortlist_empty": "No Schools Shortlisted Yet",
  "shortlist_empty_cta": "Explore Schools",
  "calendar_empty": "No Events This Month"
}
```

- [ ] **Step 2: Create src/i18n/tc.json**

```json
{
  "app_name": "\u5b78\u8def HK",
  "tab_discover": "\u63a2\u7d22",
  "tab_map": "\u5730\u5716",
  "tab_shortlist": "\u6536\u85cf",
  "tab_calendar": "\u65e5\u66c6",
  "tab_settings": "\u8a2d\u5b9a",
  "loading": "\u8f09\u5165\u4e2d...",
  "seeding_schools": "\u4e0b\u8f09\u5b78\u6821\u8cc7\u6599...",
  "seeding_hei": "\u4e0b\u8f09\u9662\u6821\u8cc7\u6599...",
  "seeding_ugc": "\u4e0b\u8f09\u8ab2\u7a0b\u8cc7\u6599...",
  "seeding_saving": "\u5132\u5b58\u8cc7\u6599...",
  "seed_complete": "\u8cc7\u6599\u8f09\u5165\u6210\u529f",
  "seed_error": "\u8cc7\u6599\u8f09\u5165\u5931\u6557",
  "seed_retry": "\u9ede\u64ca\u91cd\u8a66",
  "seed_offline": "\u8acb\u9023\u63a5\u4e92\u806f\u7db2\u4ee5\u4e0b\u8f09\u5b78\u6821\u8cc7\u6599",
  "no_results": "\u6c92\u6709\u7d50\u679c",
  "screen_school_detail": "\u5b78\u6821\u8a73\u60c5",
  "screen_institution_detail": "\u9662\u6821\u8a73\u60c5",
  "screen_compare": "\u6bd4\u8f03\u5b78\u6821",
  "screen_event_detail": "\u6d3b\u52d5\u8a73\u60c5",
  "screen_create_event": "\u65b0\u589e\u6d3b\u52d5",
  "education_kg": "\u5e7c\u7a1a\u5712",
  "education_primary": "\u5c0f\u5b78",
  "education_secondary": "\u4e2d\u5b78",
  "education_university": "\u5927\u5b78",
  "placeholder_coming_soon": "\u5373\u5c07\u63a8\u51fa",
  "shortlist_empty": "\u5c1a\u672a\u6536\u85cf\u5b78\u6821",
  "shortlist_empty_cta": "\u63a2\u7d22\u5b78\u6821",
  "calendar_empty": "\u672c\u6708\u6c92\u6709\u6d3b\u52d5"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/
git commit -m "feat: add EN and TC translation files for i18n"
```

---

### Task 5: LanguageProvider

**Files:**
- Create: `src/providers/LanguageProvider.tsx`

- [ ] **Step 1: Create src/providers/LanguageProvider.tsx**

```tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getLocales } from "expo-localization";
import { storage } from "@/stores/mmkv";
import en from "@/i18n/en.json";
import tc from "@/i18n/tc.json";

export type Locale = "en" | "tc";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = { en, tc };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  const saved = storage.getString("locale") as Locale | undefined;
  if (saved === "en" || saved === "tc") return saved;
  const deviceLocale = getLocales()[0]?.languageTag ?? "en";
  return deviceLocale.startsWith("zh") ? "tc" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    storage.set("locale", newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/providers/LanguageProvider.tsx
git commit -m "feat: add LanguageProvider with EN/TC switching and MMKV persistence"
```

---

### Task 6: ThemeProvider

**Files:**
- Create: `src/providers/ThemeProvider.tsx`

- [ ] **Step 1: Create src/providers/ThemeProvider.tsx**

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { storage } from "@/stores/mmkv";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  colorScheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialPreference(): ThemePreference {
  const saved = storage.getString("theme-preference");
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(
    getInitialPreference
  );

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    storage.set("theme-preference", pref);
    Appearance.setColorScheme(pref === "system" ? null : pref);
  }, []);

  useEffect(() => {
    if (preference !== "system") {
      Appearance.setColorScheme(preference);
    }
  }, [preference]);

  const colorScheme: "light" | "dark" =
    preference === "system" ? (systemScheme ?? "light") : preference;

  return (
    <ThemeContext.Provider value={{ preference, setPreference, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/providers/ThemeProvider.tsx
git commit -m "feat: add ThemeProvider with light/dark/system mode and MMKV persistence"
```

---

### Task 7: DatabaseProvider

**Files:**
- Create: `src/providers/DatabaseProvider.tsx`

- [ ] **Step 1: Create src/providers/DatabaseProvider.tsx**

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { isSeeded, seedDatabase, type SeedProgress } from "@/db/seed";

interface DatabaseContextValue {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({ isReady: false });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [isReady, setIsReady] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SeedProgress | null>(null);

  const runSeed = useCallback(async () => {
    try {
      setSeedError(null);
      const alreadySeeded = await isSeeded(db);
      if (alreadySeeded) {
        setIsReady(true);
        return;
      }

      setIsSeeding(true);
      await seedDatabase(db, (p) => setProgress(p));
      setIsSeeding(false);
      setIsReady(true);
    } catch (err) {
      setIsSeeding(false);
      setSeedError(err instanceof Error ? err.message : String(err));
    }
  }, [db]);

  useEffect(() => {
    runSeed();
  }, [runSeed]);

  if (seedError) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-light px-8">
        <Text className="text-xl font-bold text-primary mb-2">
          Failed to Load Data
        </Text>
        <Text className="text-base text-text-secondary text-center mb-6">
          {seedError}
        </Text>
        <Pressable
          onPress={runSeed}
          className="bg-accent px-6 py-3 rounded-lg"
        >
          <Text className="text-base font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-light px-8">
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text className="text-lg font-semibold text-primary mt-4 mb-2">
          {isSeeding ? "Setting Up" : "Loading"}
        </Text>
        <Text className="text-base text-text-secondary text-center">
          {progress?.message ?? "Preparing database..."}
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/providers/DatabaseProvider.tsx
git commit -m "feat: add DatabaseProvider with seed gate, loading screen, and error retry"
```

---

### Task 8: Data Access Hooks

**Files:**
- Create: `src/hooks/useSchools.ts`
- Create: `src/hooks/useInstitutions.ts`
- Create: `src/hooks/useProgrammes.ts`
- Create: `src/hooks/useSchoolCount.ts`
- Create: `src/hooks/useCalendarEvents.ts`
- Create: `src/hooks/useNetworkStatus.ts`

- [ ] **Step 1: Create src/hooks/useSchools.ts**

```ts
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { School } from "@/types/school";
import { getSchools } from "@/repositories/schoolRepository";
import { useFilterStore } from "@/stores/useFilterStore";

export function useSchools(limit = 50, offset = 0) {
  const db = useSQLiteContext();
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSchools(
      db,
      { educationLevel, searchQuery, districts, financeTypes, religions, sessions, genders },
      limit,
      offset
    ).then((result) => {
      if (!cancelled) {
        setSchools(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, educationLevel, searchQuery, districts, financeTypes, religions, sessions, genders, limit, offset]);

  return { schools, loading };
}
```

- [ ] **Step 2: Create src/hooks/useInstitutions.ts**

```ts
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { HeiInstitution } from "@/types/school";
import { getInstitutions } from "@/repositories/heiRepository";

export function useInstitutions(searchQuery = "", limit = 50, offset = 0) {
  const db = useSQLiteContext();
  const [institutions, setInstitutions] = useState<HeiInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInstitutions(db, searchQuery, limit, offset).then((result) => {
      if (!cancelled) {
        setInstitutions(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, searchQuery, limit, offset]);

  return { institutions, loading };
}
```

- [ ] **Step 3: Create src/hooks/useProgrammes.ts**

```ts
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { UgcProgramme } from "@/types/school";
import { getProgrammes } from "@/repositories/programmeRepository";
import { useUniFilterStore } from "@/stores/useUniFilterStore";

export function useProgrammes(limit = 50, offset = 0) {
  const db = useSQLiteContext();
  const scope = useUniFilterStore((s) => s.scope);
  const studyLevels = useUniFilterStore((s) => s.studyLevels);
  const modesOfStudy = useUniFilterStore((s) => s.modesOfStudy);
  const programmeSearch = useUniFilterStore((s) => s.programmeSearch);
  const districts = useUniFilterStore((s) => s.districts);

  const [programmes, setProgrammes] = useState<UgcProgramme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProgrammes(
      db,
      { scope, studyLevels, modesOfStudy, programmeSearch, districts },
      limit,
      offset
    ).then((result) => {
      if (!cancelled) {
        setProgrammes(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, scope, studyLevels, modesOfStudy, programmeSearch, districts, limit, offset]);

  return { programmes, loading };
}
```

- [ ] **Step 4: Create src/hooks/useSchoolCount.ts**

```ts
import { useEffect, useState, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getSchoolCount } from "@/repositories/schoolRepository";
import { useFilterStore } from "@/stores/useFilterStore";

const DEBOUNCE_MS = 300;

export function useSchoolCount() {
  const db = useSQLiteContext();
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);

  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      getSchoolCount(db, {
        educationLevel,
        searchQuery,
        districts,
        financeTypes,
        religions,
        sessions,
        genders,
      }).then(setCount);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [db, educationLevel, searchQuery, districts, financeTypes, religions, sessions, genders]);

  return count;
}
```

- [ ] **Step 5: Create src/hooks/useCalendarEvents.ts**

```ts
import { useEffect, useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { CalendarEvent } from "@/types/calendar";
import { getEventsByMonth } from "@/repositories/calendarRepository";

export function useCalendarEvents(year: number, month: number) {
  const db = useSQLiteContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getEventsByMonth(db, year, month).then((result) => {
      setEvents(result);
      setLoading(false);
    });
  }, [db, year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
```

- [ ] **Step 6: Create src/hooks/useNetworkStatus.ts**

```ts
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
  }, []);

  return isConnected;
}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/hooks/
git commit -m "feat: add data access hooks for schools, institutions, programmes, calendar, and network"
```

---

### Task 9: Tab Navigator with Placeholder Screens

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/discover/index.tsx`
- Create: `app/(tabs)/map/index.tsx`
- Create: `app/(tabs)/shortlist/index.tsx`
- Create: `app/(tabs)/calendar/index.tsx`
- Create: `app/(tabs)/settings/index.tsx`

- [ ] **Step 1: Create app/(tabs)/_layout.tsx**

```tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.light.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.light.surface,
          borderTopColor: COLORS.light.hairline,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shortlist"
        options={{
          title: "Shortlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Create all 5 placeholder tab screens**

`app/(tabs)/discover/index.tsx`:

```tsx
import { View, Text } from "react-native";
import { useSchoolCount } from "@/hooks/useSchoolCount";

export default function DiscoverScreen() {
  const count = useSchoolCount();

  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-2xl font-bold text-primary mb-2">Discover</Text>
      <Text className="text-base text-text-secondary">
        {count} schools found
      </Text>
    </View>
  );
}
```

`app/(tabs)/map/index.tsx`:

```tsx
import { View, Text } from "react-native";

export default function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-2xl font-bold text-primary">Map</Text>
      <Text className="text-base text-text-secondary mt-2">Coming soon</Text>
    </View>
  );
}
```

`app/(tabs)/shortlist/index.tsx`:

```tsx
import { View, Text } from "react-native";
import { useShortlistStore } from "@/stores/useShortlistStore";

export default function ShortlistScreen() {
  const count = useShortlistStore((s) => s.shortlistedIds.length);

  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-2xl font-bold text-primary mb-2">Shortlist</Text>
      <Text className="text-base text-text-secondary">
        {count} schools saved
      </Text>
    </View>
  );
}
```

`app/(tabs)/calendar/index.tsx`:

```tsx
import { View, Text } from "react-native";

export default function CalendarScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-2xl font-bold text-primary">Calendar</Text>
      <Text className="text-base text-text-secondary mt-2">Coming soon</Text>
    </View>
  );
}
```

`app/(tabs)/settings/index.tsx`:

```tsx
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export default function SettingsScreen() {
  const { preference } = useTheme();
  const { locale } = useLanguage();

  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-2xl font-bold text-primary mb-4">Settings</Text>
      <Text className="text-base text-text-secondary">
        Theme: {preference}
      </Text>
      <Text className="text-base text-text-secondary">
        Language: {locale.toUpperCase()}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/
git commit -m "feat: add 5-tab bottom navigator with placeholder screens"
```

---

### Task 10: Stack Routes

**Files:**
- Create: `app/school/[id].tsx`
- Create: `app/institution/[id].tsx`
- Create: `app/compare/index.tsx`
- Create: `app/event/[id].tsx`
- Create: `app/event/create.tsx`

- [ ] **Step 1: Create all stack route placeholders**

`app/school/[id].tsx`:

```tsx
import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "School Detail" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          School Detail
        </Text>
        <Text className="text-base text-text-secondary">ID: {id}</Text>
      </View>
    </>
  );
}
```

`app/institution/[id].tsx`:

```tsx
import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function InstitutionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Institution Detail" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          Institution Detail
        </Text>
        <Text className="text-base text-text-secondary">ID: {id}</Text>
      </View>
    </>
  );
}
```

`app/compare/index.tsx`:

```tsx
import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useCompareStore } from "@/stores/useCompareStore";

export default function CompareScreen() {
  const count = useCompareStore((s) => s.selectedIds.length);

  return (
    <>
      <Stack.Screen options={{ title: "Compare Schools" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          Compare Schools
        </Text>
        <Text className="text-base text-text-secondary">
          {count} schools selected
        </Text>
      </View>
    </>
  );
}
```

`app/event/[id].tsx`:

```tsx
import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Event Detail" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          Event Detail
        </Text>
        <Text className="text-base text-text-secondary">ID: {id}</Text>
      </View>
    </>
  );
}
```

`app/event/create.tsx`:

```tsx
import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function CreateEventScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Event" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary">New Event</Text>
        <Text className="text-base text-text-secondary mt-2">Coming soon</Text>
      </View>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/school/ app/institution/ app/compare/ app/event/
git commit -m "feat: add stack route placeholders for school, institution, compare, and event screens"
```

---

### Task 11: Root Layout with All Providers

**Files:**
- Modify: `app/_layout.tsx`
- Delete: `app/index.tsx` (replaced by tab navigator as default route)

- [ ] **Step 1: Replace app/_layout.tsx with full provider stack**

```tsx
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { DATABASE_NAME } from "@/db/client";
import { createTables } from "@/db/schema";
import { migrateIfNeeded } from "@/db/migrations";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";

SplashScreen.preventAutoHideAsync();

async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await createTables(db);
  await migrateIfNeeded(db);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <DatabaseProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="school/[id]"
                options={{ headerShown: true, headerTitle: "" }}
              />
              <Stack.Screen
                name="institution/[id]"
                options={{ headerShown: true, headerTitle: "" }}
              />
              <Stack.Screen
                name="compare/index"
                options={{ headerShown: true, headerTitle: "Compare" }}
              />
              <Stack.Screen
                name="event/[id]"
                options={{ headerShown: true, headerTitle: "" }}
              />
              <Stack.Screen
                name="event/create"
                options={{ headerShown: true, headerTitle: "New Event" }}
              />
            </Stack>
          </LanguageProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </SQLiteProvider>
  );
}
```

- [ ] **Step 2: Delete app/index.tsx**

The old test harness is no longer needed. With the `(tabs)` group, Expo Router will use `app/(tabs)/discover/index.tsx` as the default route.

```bash
rm app/index.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git rm app/index.tsx
git commit -m "feat: wire root layout with SQLiteProvider, DatabaseProvider, ThemeProvider, LanguageProvider, and navigation stack"
```

---

### Task 12: Verification

- [ ] **Step 1: Start Metro and verify no bundler errors**

```bash
npx expo start
```

Expected: Metro starts without errors. No missing module warnings.

- [ ] **Step 2: Run all Jest tests**

```bash
npx jest --verbose
```

Expected: All 13 parser tests still pass.

- [ ] **Step 3: Verify on Android emulator (if available)**

```bash
npx expo run:android
```

Expected behavior:
1. Splash screen shows briefly
2. Loading/seeding screen appears (DatabaseProvider) with progress messages
3. After seeding completes, 5-tab bottom navigator appears
4. Discover tab shows school count
5. All tabs are tappable and show placeholder content
6. Settings tab shows current theme preference and locale

- [ ] **Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "chore: final Plan 2 verification and adjustments"
```
