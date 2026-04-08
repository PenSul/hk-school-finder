# HK School Finder - Plan 1: Foundation & Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Expo project, install all dependencies, and build the complete data layer (types, constants, database schema, repositories, seed logic) that all UI features depend on.

**Architecture:** SQLite-first offline architecture. Three government APIs are fetched once on first launch, parsed into typed objects, and batch-inserted into local SQLite tables. A thin repository layer encapsulates all SQL queries. Pure parsing functions are unit-tested with Jest. Repositories are verified via end-to-end device testing.

**Tech Stack:** Expo SDK 55 (React Native 0.83, React 19.2), TypeScript strict, expo-sqlite (JSI), NativeWind v4 + Tailwind 3.4.x, @tanstack/react-query (seed orchestration only)

**Spec Reference:** `docs/superpowers/specs/2026-04-08-hk-school-finder-design.md`

---

## File Structure (this plan creates)

```
hk-school-finder/
  package.json
  app.json
  tsconfig.json
  babel.config.js
  metro.config.js
  tailwind.config.js
  global.css
  nativewind-env.d.ts
  app/
    _layout.tsx              -- minimal placeholder
    index.tsx                -- minimal placeholder
  src/
    types/
      school.ts              -- School, HeiInstitution, UgcProgramme + raw API types
      filter.ts              -- EducationLevel, K12FilterState, UniFilterState
      calendar.ts            -- CalendarEvent, EventCategory
    constants/
      colors.ts              -- theme tokens (light + dark)
      districts.ts           -- 18 HK districts EN/TC
      financeTypes.ts        -- finance type badge config
      religions.ts           -- religion options EN/TC
      eventCategories.ts     -- calendar event category config
    db/
      client.ts              -- database name constant
      schema.ts              -- CREATE TABLE + CREATE INDEX statements
      parsers.ts             -- pure functions: raw API JSON -> DB row objects
      parsers.test.ts        -- unit tests for parsers
      seed.ts                -- fetch APIs + batch INSERT using parsers
      migrations.ts          -- DB version upgrade logic
    repositories/
      schoolRepository.ts    -- K-12 queries with filters
      heiRepository.ts       -- HEI queries
      programmeRepository.ts -- UGC programme queries
      calendarRepository.ts  -- calendar events CRUD
  assets/
    data/
      School-Location-and-Information.json   (7-record dev fixture)
      Higher-Education-Institutions.json     (full 122-record dataset)
      List-of-UGC-funded-Programmes.json     (full ~1031-record dataset)
```

---

### Task 1: Initialize Expo Project

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json` (via create-expo-app)
- Modify: `package.json` (main entry)

- [ ] **Step 1: Create the project and install all dependencies**

```bash
npx create-expo-app@latest hk-school-finder --template blank-typescript
cd hk-school-finder

# Expo-managed packages (pinned to SDK 55 compatible versions)
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar expo-font expo-splash-screen expo-sqlite expo-image expo-localization expo-notifications expo-calendar react-native-maps @react-native-community/netinfo react-native-gesture-handler react-native-reanimated @shopify/flash-list

# Community / third-party packages
npm install @gorhom/bottom-sheet@5 @tanstack/react-query react-native-mmkv zustand nativewind@4 @sentry/react-native

# Build-time dependencies
npm install -D tailwindcss@^3.4 babel-plugin-module-resolver
```

- [ ] **Step 2: Set package.json main entry to expo-router**

In `package.json`, change the `"main"` field:

```json
{
  "main": "expo-router/entry"
}
```

Also add Jest module name mapper for the `@/` path alias:

```json
{
  "jest": {
    "preset": "jest-expo",
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

- [ ] **Step 3: Copy asset data files**

```bash
mkdir -p assets/data
```

Copy these files into `assets/data/`:
- `School-Location-and-Information.json` (7-record sample from spec project)
- `Higher-Education-Institutions.json` (122 records, full dataset)
- `List-of-UGC-funded-Programmes.json` (~1031 records, full dataset)

- [ ] **Step 4: Commit**

```bash
git init
git add package.json package-lock.json app.json tsconfig.json assets/
git commit -m "chore: initialize Expo SDK 55 project with all dependencies"
```

---

### Task 2: Configure Build Toolchain

**Files:**
- Create: `babel.config.js` (overwrite generated)
- Create: `metro.config.js`
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`
- Modify: `tsconfig.json`
- Modify: `app.json`
- Delete: `App.tsx`
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`

- [ ] **Step 1: Create babel.config.js**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [["module-resolver", { alias: { "@": "./src" } }]],
  };
};
```

- [ ] **Step 2: Create metro.config.js**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 3: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A5F",
        accent: "#F59E0B",
        "bg-light": "#F8FAFC",
        "bg-dark": "#0F172A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "text-primary": "#1E293B",
        "text-secondary": "#64748B",
        hairline: "#E2E8F0",
        "diff-highlight": "#FEF3C7",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Create global.css and nativewind-env.d.ts**

`global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`nativewind-env.d.ts`:

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 5: Update tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

- [ ] **Step 6: Update app.json**

Replace the `"expo"` object with:

```json
{
  "expo": {
    "name": "HK School Finder",
    "slug": "hk-school-finder",
    "version": "1.0.0",
    "scheme": "hk-school-finder",
    "orientation": "portrait",
    "newArchEnabled": true,
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A5F"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hkschoolfinder.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E3A5F"
      },
      "package": "com.hkschoolfinder.app",
      "usesCleartextTraffic": true
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-localization",
      "expo-sqlite"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

Note: `usesCleartextTraffic: true` is required because the EDB schools API uses HTTP.

- [ ] **Step 7: Create Expo Router entry points and delete App.tsx**

Delete `App.tsx` (no longer needed with expo-router).

`app/_layout.tsx`:

```tsx
import "../global.css";
import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />;
}
```

`app/index.tsx`:

```tsx
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <Text className="text-xl font-bold text-primary">HK School Finder</Text>
    </View>
  );
}
```

- [ ] **Step 8: Verify the project compiles**

```bash
npx expo start
```

Expected: Metro bundler starts without errors. Pressing `a` (Android) or scanning QR shows "HK School Finder" centered.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: configure NativeWind v4, Expo Router, TypeScript paths, and app metadata"
```

---

### Task 3: Define TypeScript Types

**Files:**
- Create: `src/types/school.ts`
- Create: `src/types/filter.ts`
- Create: `src/types/calendar.ts`

- [ ] **Step 1: Create src/types/school.ts**

```ts
/** K-12 school record stored in SQLite */
export interface School {
  school_no: string;
  name_en: string;
  name_tc: string;
  category_en: string;
  category_tc: string;
  address_en: string;
  address_tc: string;
  school_level_en: string;
  school_level_tc: string;
  district_en: string;
  district_tc: string;
  finance_type_en: string;
  finance_type_tc: string;
  religion_en: string;
  religion_tc: string;
  session_en: string;
  session_tc: string;
  students_gender_en: string;
  students_gender_tc: string;
  telephone: string;
  fax: string;
  website: string;
  latitude: number;
  longitude: number;
}

/** Higher Education Institution record */
export interface HeiInstitution {
  objectid: number;
  facility_name_en: string;
  facility_name_tc: string;
  address_en: string;
  address_tc: string;
  telephone: string;
  fax: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
}

/** UGC-funded programme record */
export interface UgcProgramme {
  objectid: number;
  university_en: string;
  university_tc: string;
  programme_name_en: string;
  programme_name_tc: string;
  level_of_study_en: string;
  level_of_study_tc: string;
  mode_of_study_en: string;
  mode_of_study_tc: string;
  latitude: number;
  longitude: number;
}

/**
 * Raw school record from EDB API JSON.
 * Keys match the API response exactly (UPPER CASE English + Chinese).
 */
export interface RawSchool {
  "SCHOOL NO.": number;
  "ENGLISH NAME": string;
  "\u4e2d\u6587\u540d\u7a31": string;
  "ENGLISH CATEGORY": string;
  "\u4e2d\u6587\u985e\u5225": string;
  "ENGLISH ADDRESS": string;
  "\u4e2d\u6587\u5730\u5740": string;
  "SCHOOL LEVEL": string;
  "\u5b78\u6821\u985e\u578b": string;
  "DISTRICT": string;
  "\u5206\u5340": string;
  "FINANCE TYPE": string;
  "\u8cc7\u52a9\u7a2e\u985e": string;
  "RELIGION": string;
  "\u5b97\u6559": string;
  "SESSION": string;
  "\u5b78\u6821\u6388\u8ab2\u6642\u9593": string;
  "STUDENTS GENDER": string;
  "\u5c31\u8b80\u5b78\u751f\u6027\u5225": string;
  "TELEPHONE": string;
  "\u806f\u7d61\u96fb\u8a71": string;
  "FAX NUMBER": string;
  "\u50b3\u771f\u865f\u78bc": string;
  "WEBSITE": string;
  "\u7db2\u9801": string;
  "LONGITUDE": number;
  "LATITUDE": number;
}

/** Raw HEI feature from ASFPS GeoJSON API */
export interface RawHeiProperties {
  OBJECTID: number;
  Facility_Name: string;
  "\u8a2d\u65bd\u540d\u7a31": string;
  Address: string;
  "\u5730\u5740": string;
  Telephone: string | null;
  "\u806f\u7d61\u96fb\u8a71": string | null;
  Fax_Number: string | null;
  "\u50b3\u771f\u865f\u78bc": string | null;
  Email_Address: string | null;
  "\u96fb\u90f5\u5730\u5740": string | null;
  Website: string | null;
  "\u7db2\u9801": string | null;
  "Latitude___\u7def\u5ea6": number;
  "Longitude___\u7d93\u5ea6": number;
}

export interface RawHeiFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RawHeiProperties;
}

/** Raw UGC programme feature from GeoJSON API */
export interface RawUgcProperties {
  OBJECTID: number;
  University_EN: string;
  University_TC: string;
  Programme_Name_EN: string;
  Programme_Name_TC: string;
  Level_of_Study_EN: string;
  Level_of_Study_TC: string;
  Mode_of_Study_EN: string;
  Mode_of_Study_TC: string;
  Latitude: number;
  Longitude: number;
}

export interface RawUgcFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RawUgcProperties;
}

export interface GeoJsonCollection<F> {
  type: "FeatureCollection";
  features: F[];
}
```

- [ ] **Step 2: Create src/types/filter.ts**

```ts
export type EducationLevel = "KG" | "PRIMARY" | "SECONDARY" | "UNIVERSITY";

export interface K12FilterState {
  educationLevel: EducationLevel;
  searchQuery: string;
  districts: string[];
  financeTypes: string[];
  religions: string[];
  sessions: string[];
  genders: string[];
}

export interface UniFilterState {
  scope: "UGC" | "ALL";
  studyLevels: string[];
  modesOfStudy: string[];
  programmeSearch: string;
  districts: string[];
}
```

- [ ] **Step 3: Create src/types/calendar.ts**

```ts
export type EventCategory = "poa" | "kg" | "open_day" | "sspa" | "custom";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  category: EventCategory;
  school_no: string | null;
  reminder_enabled: boolean;
  is_seeded: boolean;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  category: EventCategory;
  school_no?: string;
  reminder_enabled?: boolean;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions for schools, filters, and calendar"
```

---

### Task 4: Define Constants

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/districts.ts`
- Create: `src/constants/financeTypes.ts`
- Create: `src/constants/religions.ts`
- Create: `src/constants/eventCategories.ts`

- [ ] **Step 1: Create src/constants/colors.ts**

```ts
export const COLORS = {
  primary: "#1E3A5F",
  accent: "#F59E0B",
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    hairline: "#E2E8F0",
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    hairline: "#334155",
  },
  diffHighlight: "#FEF3C7",
} as const;
```

- [ ] **Step 2: Create src/constants/districts.ts**

```ts
export interface District {
  en: string;
  tc: string;
}

export const DISTRICTS: District[] = [
  { en: "CENTRAL AND WESTERN", tc: "\u4e2d\u897f\u5340" },
  { en: "EASTERN", tc: "\u6771\u5340" },
  { en: "ISLANDS", tc: "\u96e2\u5cf6\u5340" },
  { en: "KOWLOON CITY", tc: "\u4e5d\u9f8d\u57ce\u5340" },
  { en: "KWAI TSING", tc: "\u8475\u9752\u5340" },
  { en: "KWUN TONG", tc: "\u89c0\u5858\u5340" },
  { en: "NORTH", tc: "\u5317\u5340" },
  { en: "SAI KUNG", tc: "\u897f\u8ca2\u5340" },
  { en: "SHA TIN", tc: "\u6c99\u7530\u5340" },
  { en: "SHAM SHUI PO", tc: "\u6df1\u6c34\u57d7\u5340" },
  { en: "SOUTHERN", tc: "\u5357\u5340" },
  { en: "TAI PO", tc: "\u5927\u57d4\u5340" },
  { en: "TSUEN WAN", tc: "\u8343\u7063\u5340" },
  { en: "TUEN MUN", tc: "\u5c6f\u9580\u5340" },
  { en: "WAN CHAI", tc: "\u7063\u4ed4\u5340" },
  { en: "WONG TAI SIN", tc: "\u9ec3\u5927\u4ed9\u5340" },
  { en: "YAU TSIM MONG", tc: "\u6cb9\u5c16\u65fa\u5340" },
  { en: "YUEN LONG", tc: "\u5143\u6717\u5340" },
];
```

- [ ] **Step 3: Create src/constants/financeTypes.ts**

```ts
export interface FinanceTypeConfig {
  labelEn: string;
  labelTc: string;
  color: string;
}

export const FINANCE_TYPES: Record<string, FinanceTypeConfig> = {
  GOVERNMENT: { labelEn: "Government", labelTc: "\u5b98\u7acb", color: "#1E3A5F" },
  AIDED: { labelEn: "Aided", labelTc: "\u8cc7\u52a9", color: "#0D9488" },
  DSS: { labelEn: "DSS", labelTc: "\u76f4\u8cc7", color: "#7C3AED" },
  ESF: { labelEn: "ESF", labelTc: "\u82f1\u57fa", color: "#0284C7" },
  PRIVATE: { labelEn: "Private", labelTc: "\u79c1\u7acb", color: "#64748B" },
  CAPUT: { labelEn: "Caput", labelTc: "\u6309\u4f4d\u6d25\u8cbc", color: "#EA580C" },
  "UGC-FUNDED": { labelEn: "UGC-funded", labelTc: "\u6559\u8cc7\u6703\u8cc7\u52a9", color: "#D97706" },
};
```

- [ ] **Step 4: Create src/constants/religions.ts**

```ts
export interface Religion {
  en: string;
  tc: string;
}

export const RELIGIONS: Religion[] = [
  { en: "CATHOLICISM", tc: "\u5929\u4e3b\u6559" },
  { en: "PROTESTANTISM / CHRISTIANITY", tc: "\u57fa\u7763\u6559" },
  { en: "BUDDHISM", tc: "\u4f5b\u6559" },
  { en: "TAOISM", tc: "\u9053\u6559" },
  { en: "ISLAM", tc: "\u4f0a\u65af\u862d\u6559" },
  { en: "CONFUCIANISM", tc: "\u5b54\u6559" },
  { en: "NOT APPLICABLE", tc: "\u4e0d\u9069\u7528" },
];
```

- [ ] **Step 5: Create src/constants/eventCategories.ts**

```ts
import type { EventCategory } from "@/types/calendar";

export interface EventCategoryConfig {
  labelEn: string;
  labelTc: string;
  color: string;
}

export const EVENT_CATEGORIES: Record<EventCategory, EventCategoryConfig> = {
  poa: { labelEn: "POA", labelTc: "\u7d71\u4e00\u6d3e\u4f4d", color: "#1E3A5F" },
  kg: { labelEn: "KG", labelTc: "\u5e7c\u7a1a\u5712", color: "#0D9488" },
  open_day: { labelEn: "Open Day", labelTc: "\u958b\u653e\u65e5", color: "#F59E0B" },
  sspa: { labelEn: "SSPA", labelTc: "\u4e2d\u5b78\u5b78\u4f4d\u5206\u914d", color: "#EF4444" },
  custom: { labelEn: "Custom", labelTc: "\u81ea\u8a02", color: "#64748B" },
};
```

- [ ] **Step 6: Commit**

```bash
git add src/constants/
git commit -m "feat: add theme colors, districts, finance types, religions, and event category constants"
```

---

### Task 5: Database Client & Schema

**Files:**
- Create: `src/db/client.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/migrations.ts`

- [ ] **Step 1: Create src/db/client.ts**

```ts
export const DATABASE_NAME = "hk-school-finder.db";
```

The actual database instance is opened by `SQLiteProvider` in the root layout (Plan 2). This module exports the database name constant used across the app.

- [ ] **Step 2: Create src/db/schema.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";

const CREATE_SCHOOLS = `
CREATE TABLE IF NOT EXISTS schools (
  school_no TEXT NOT NULL PRIMARY KEY,
  name_en TEXT,
  name_tc TEXT,
  category_en TEXT,
  category_tc TEXT,
  address_en TEXT,
  address_tc TEXT,
  school_level_en TEXT,
  school_level_tc TEXT,
  district_en TEXT,
  district_tc TEXT,
  finance_type_en TEXT,
  finance_type_tc TEXT,
  religion_en TEXT,
  religion_tc TEXT,
  session_en TEXT,
  session_tc TEXT,
  students_gender_en TEXT,
  students_gender_tc TEXT,
  telephone TEXT,
  fax TEXT,
  website TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_HEI = `
CREATE TABLE IF NOT EXISTS hei_institutions (
  objectid INTEGER NOT NULL PRIMARY KEY,
  facility_name_en TEXT,
  facility_name_tc TEXT,
  address_en TEXT,
  address_tc TEXT,
  telephone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_UGC = `
CREATE TABLE IF NOT EXISTS ugc_programmes (
  objectid INTEGER NOT NULL PRIMARY KEY,
  university_en TEXT,
  university_tc TEXT,
  programme_name_en TEXT,
  programme_name_tc TEXT,
  level_of_study_en TEXT,
  level_of_study_tc TEXT,
  mode_of_study_en TEXT,
  mode_of_study_tc TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_CALENDAR = `
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_time TEXT,
  category TEXT NOT NULL,
  school_no TEXT,
  reminder_enabled INTEGER DEFAULT 0,
  is_seeded INTEGER DEFAULT 0
);`;

const CREATE_METADATA = `
CREATE TABLE IF NOT EXISTS db_metadata (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL
);`;

const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_schools_level ON schools(school_level_en);
CREATE INDEX IF NOT EXISTS idx_schools_district ON schools(district_en);
CREATE INDEX IF NOT EXISTS idx_schools_finance ON schools(finance_type_en);
CREATE INDEX IF NOT EXISTS idx_schools_religion ON schools(religion_en);
CREATE INDEX IF NOT EXISTS idx_schools_session ON schools(session_en);
CREATE INDEX IF NOT EXISTS idx_schools_gender ON schools(students_gender_en);
CREATE INDEX IF NOT EXISTS idx_hei_name ON hei_institutions(facility_name_en);
CREATE INDEX IF NOT EXISTS idx_ugc_university ON ugc_programmes(university_en);
CREATE INDEX IF NOT EXISTS idx_ugc_programme ON ugc_programmes(programme_name_en);
CREATE INDEX IF NOT EXISTS idx_ugc_level ON ugc_programmes(level_of_study_en);
CREATE INDEX IF NOT EXISTS idx_ugc_mode ON ugc_programmes(mode_of_study_en);
CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON calendar_events(category);
`;

/** Creates all tables and indexes. Safe to call multiple times (IF NOT EXISTS). */
export async function createTables(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_SCHOOLS}
    ${CREATE_HEI}
    ${CREATE_UGC}
    ${CREATE_CALENDAR}
    ${CREATE_METADATA}
    ${CREATE_INDEXES}
  `);
}
```

- [ ] **Step 3: Create src/db/migrations.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Runs schema migrations if needed. Called after createTables.
 * Version 1 is the initial schema -- no migrations needed yet.
 * Future migrations go here as version numbers increment.
 */
export async function migrateIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db
    .getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = ?",
      "schema_version"
    )
    .catch(() => null);

  const version = row ? parseInt(row.value, 10) : 0;

  if (version < CURRENT_SCHEMA_VERSION) {
    // Future: if (version < 2) { await migrateV1ToV2(db); }

    await db.runAsync(
      "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
      "schema_version",
      String(CURRENT_SCHEMA_VERSION)
    );
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/db/
git commit -m "feat: add database client, schema definitions, and migration framework"
```

---

### Task 6: Data Parsers (TDD)

**Files:**
- Create: `src/db/parsers.test.ts`
- Create: `src/db/parsers.ts`

- [ ] **Step 1: Write failing tests for all three parsers**

`src/db/parsers.test.ts`:

```ts
import { parseSchool, parseHeiInstitution, parseUgcProgramme } from "./parsers";
import type { RawSchool, RawHeiFeature, RawUgcFeature } from "@/types/school";

describe("parseSchool", () => {
  const raw: RawSchool = {
    "SCHOOL NO.": 610224000123,
    "ENGLISH NAME": "TEST SCHOOL",
    "\u4e2d\u6587\u540d\u7a31": "\u6e2c\u8a66\u5b78\u6821",
    "ENGLISH CATEGORY": "Aided Primary Schools",
    "\u4e2d\u6587\u985e\u5225": "\u8cc7\u52a9\u5c0f\u5b78",
    "ENGLISH ADDRESS": "123 TEST STREET",
    "\u4e2d\u6587\u5730\u5740": "\u6e2c\u8a66\u8857123\u865f",
    "SCHOOL LEVEL": "PRIMARY",
    "\u5b78\u6821\u985e\u578b": "\u5c0f\u5b78",
    DISTRICT: "TAI PO",
    "\u5206\u5340": "\u5927\u57d4\u5340",
    "FINANCE TYPE": "AIDED",
    "\u8cc7\u52a9\u7a2e\u985e": "\u8cc7\u52a9",
    RELIGION: "PROTESTANTISM / CHRISTIANITY",
    "\u5b97\u6559": "\u57fa\u7763\u6559",
    SESSION: "WHOLE DAY",
    "\u5b78\u6821\u6388\u8ab2\u6642\u9593": "\u5168\u65e5",
    "STUDENTS GENDER": "CO-ED",
    "\u5c31\u8b80\u5b78\u751f\u6027\u5225": "\u7537\u5973",
    TELEPHONE: "26686112",
    "\u806f\u7d61\u96fb\u8a71": "26686112",
    "FAX NUMBER": "26686512",
    "\u50b3\u771f\u865f\u78bc": "26686512",
    WEBSITE: "http://test.edu.hk",
    "\u7db2\u9801": "http://test.edu.hk",
    LONGITUDE: 114.17140462,
    LATITUDE: 22.45533611,
  };

  it("converts numeric SCHOOL NO. to string school_no", () => {
    expect(parseSchool(raw).school_no).toBe("610224000123");
  });

  it("maps English and Chinese name fields", () => {
    const result = parseSchool(raw);
    expect(result.name_en).toBe("TEST SCHOOL");
    expect(result.name_tc).toBe("\u6e2c\u8a66\u5b78\u6821");
  });

  it("maps all filter-indexed fields", () => {
    const result = parseSchool(raw);
    expect(result.school_level_en).toBe("PRIMARY");
    expect(result.district_en).toBe("TAI PO");
    expect(result.finance_type_en).toBe("AIDED");
    expect(result.religion_en).toBe("PROTESTANTISM / CHRISTIANITY");
    expect(result.session_en).toBe("WHOLE DAY");
    expect(result.students_gender_en).toBe("CO-ED");
  });

  it("maps coordinates as numbers", () => {
    const result = parseSchool(raw);
    expect(result.latitude).toBe(22.45533611);
    expect(result.longitude).toBe(114.17140462);
  });

  it("normalizes N.A. values to empty string", () => {
    const withNA: RawSchool = {
      ...raw,
      TELEPHONE: "N.A.",
      "FAX NUMBER": "N.A.",
      WEBSITE: "N.A.",
    };
    const result = parseSchool(withNA);
    expect(result.telephone).toBe("");
    expect(result.fax).toBe("");
    expect(result.website).toBe("");
  });
});

describe("parseHeiInstitution", () => {
  const raw: RawHeiFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [114.13776262, 22.28401175] },
    properties: {
      OBJECTID: 5,
      Facility_Name: "The University of Hong Kong",
      "\u8a2d\u65bd\u540d\u7a31": "\u9999\u6e2f\u5927\u5b78",
      Address: "Pokfulam",
      "\u5730\u5740": "\u8584\u6276\u6797",
      Telephone: null,
      "\u806f\u7d61\u96fb\u8a71": null,
      Fax_Number: null,
      "\u50b3\u771f\u865f\u78bc": null,
      Email_Address: null,
      "\u96fb\u90f5\u5730\u5740": null,
      Website: null,
      "\u7db2\u9801": null,
      "Latitude___\u7def\u5ea6": 22.28401145,
      "Longitude___\u7d93\u5ea6": 114.13776262,
    },
  };

  it("maps OBJECTID", () => {
    expect(parseHeiInstitution(raw).objectid).toBe(5);
  });

  it("maps bilingual names", () => {
    const result = parseHeiInstitution(raw);
    expect(result.facility_name_en).toBe("The University of Hong Kong");
    expect(result.facility_name_tc).toBe("\u9999\u6e2f\u5927\u5b78");
  });

  it("normalizes null contact fields to empty string", () => {
    const result = parseHeiInstitution(raw);
    expect(result.telephone).toBe("");
    expect(result.fax).toBe("");
    expect(result.email).toBe("");
    expect(result.website).toBe("");
  });

  it("normalizes N.A. string contact fields to empty string", () => {
    const withNA: RawHeiFeature = {
      ...raw,
      properties: { ...raw.properties, Telephone: "N.A.", Website: "N.A." },
    };
    const result = parseHeiInstitution(withNA);
    expect(result.telephone).toBe("");
    expect(result.website).toBe("");
  });

  it("maps coordinates from Latitude___/Longitude___ properties", () => {
    const result = parseHeiInstitution(raw);
    expect(result.latitude).toBe(22.28401145);
    expect(result.longitude).toBe(114.13776262);
  });
});

describe("parseUgcProgramme", () => {
  const raw: RawUgcFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [114.17332800, 22.33608600] },
    properties: {
      OBJECTID: 1,
      University_EN: "City University of Hong Kong",
      University_TC: "\u9999\u6e2f\u57ce\u5e02\u5927\u5b78",
      Programme_Name_EN: "Bachelor of Arts and Science in New Media",
      Programme_Name_TC: "\u6587\u7406\u5b78\u58eb\uff08\u65b0\u5a92\u9ad4\uff09",
      Level_of_Study_EN: "Undergraduate",
      Level_of_Study_TC: "\u5b78\u58eb\u5b78\u4f4d\u8ab2\u7a0b",
      Mode_of_Study_EN: "Full-time",
      Mode_of_Study_TC: "\u5168\u65e5\u5236",
      Latitude: 22.33608587,
      Longitude: 114.17332840,
    },
  };

  it("maps programme identification fields", () => {
    const result = parseUgcProgramme(raw);
    expect(result.objectid).toBe(1);
    expect(result.university_en).toBe("City University of Hong Kong");
    expect(result.programme_name_en).toBe("Bachelor of Arts and Science in New Media");
  });

  it("maps study classification fields", () => {
    const result = parseUgcProgramme(raw);
    expect(result.level_of_study_en).toBe("Undergraduate");
    expect(result.mode_of_study_en).toBe("Full-time");
  });

  it("maps coordinates from properties (not geometry)", () => {
    const result = parseUgcProgramme(raw);
    expect(result.latitude).toBe(22.33608587);
    expect(result.longitude).toBe(114.17332840);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/db/parsers.test.ts
```

Expected: All tests FAIL with `Cannot find module './parsers'`.

- [ ] **Step 3: Implement src/db/parsers.ts**

```ts
import type {
  School,
  HeiInstitution,
  UgcProgramme,
  RawSchool,
  RawHeiFeature,
  RawUgcFeature,
} from "@/types/school";

/** Normalize "N.A.", "N/A", null, undefined to empty string */
function normalize(value: string | null | undefined): string {
  if (value == null) return "";
  const trimmed = value.trim();
  if (trimmed === "N.A." || trimmed === "N/A") return "";
  return trimmed;
}

export function parseSchool(raw: RawSchool): School {
  return {
    school_no: String(raw["SCHOOL NO."]),
    name_en: normalize(raw["ENGLISH NAME"]),
    name_tc: normalize(raw["\u4e2d\u6587\u540d\u7a31"]),
    category_en: normalize(raw["ENGLISH CATEGORY"]),
    category_tc: normalize(raw["\u4e2d\u6587\u985e\u5225"]),
    address_en: normalize(raw["ENGLISH ADDRESS"]),
    address_tc: normalize(raw["\u4e2d\u6587\u5730\u5740"]),
    school_level_en: normalize(raw["SCHOOL LEVEL"]),
    school_level_tc: normalize(raw["\u5b78\u6821\u985e\u578b"]),
    district_en: normalize(raw["DISTRICT"]),
    district_tc: normalize(raw["\u5206\u5340"]),
    finance_type_en: normalize(raw["FINANCE TYPE"]),
    finance_type_tc: normalize(raw["\u8cc7\u52a9\u7a2e\u985e"]),
    religion_en: normalize(raw["RELIGION"]),
    religion_tc: normalize(raw["\u5b97\u6559"]),
    session_en: normalize(raw["SESSION"]),
    session_tc: normalize(raw["\u5b78\u6821\u6388\u8ab2\u6642\u9593"]),
    students_gender_en: normalize(raw["STUDENTS GENDER"]),
    students_gender_tc: normalize(raw["\u5c31\u8b80\u5b78\u751f\u6027\u5225"]),
    telephone: normalize(raw["TELEPHONE"]),
    fax: normalize(raw["FAX NUMBER"]),
    website: normalize(raw["WEBSITE"]),
    latitude: raw["LATITUDE"] ?? 0,
    longitude: raw["LONGITUDE"] ?? 0,
  };
}

export function parseHeiInstitution(raw: RawHeiFeature): HeiInstitution {
  const p = raw.properties;
  return {
    objectid: p.OBJECTID,
    facility_name_en: normalize(p.Facility_Name),
    facility_name_tc: normalize(p["\u8a2d\u65bd\u540d\u7a31"]),
    address_en: normalize(p.Address),
    address_tc: normalize(p["\u5730\u5740"]),
    telephone: normalize(p.Telephone),
    fax: normalize(p.Fax_Number),
    email: normalize(p.Email_Address),
    website: normalize(p.Website),
    latitude: p["Latitude___\u7def\u5ea6"] ?? 0,
    longitude: p["Longitude___\u7d93\u5ea6"] ?? 0,
  };
}

export function parseUgcProgramme(raw: RawUgcFeature): UgcProgramme {
  const p = raw.properties;
  return {
    objectid: p.OBJECTID,
    university_en: normalize(p.University_EN),
    university_tc: normalize(p.University_TC),
    programme_name_en: normalize(p.Programme_Name_EN),
    programme_name_tc: normalize(p.Programme_Name_TC),
    level_of_study_en: normalize(p.Level_of_Study_EN),
    level_of_study_tc: normalize(p.Level_of_Study_TC),
    mode_of_study_en: normalize(p.Mode_of_Study_EN),
    mode_of_study_tc: normalize(p.Mode_of_Study_TC),
    latitude: p.Latitude ?? 0,
    longitude: p.Longitude ?? 0,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/db/parsers.test.ts --verbose
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/db/parsers.ts src/db/parsers.test.ts
git commit -m "feat: add data parsers for EDB, ASFPS, and UGC API responses with tests"
```

---

### Task 7: School Repository

**Files:**
- Create: `src/repositories/schoolRepository.ts`

- [ ] **Step 1: Create src/repositories/schoolRepository.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";
import type { School } from "@/types/school";
import type { K12FilterState } from "@/types/filter";

/**
 * Build WHERE clause and params from K-12 filter state.
 * Shared between getSchools and getSchoolCount.
 */
function buildWhereClause(filters: K12FilterState): {
  where: string;
  params: (string | number)[];
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // Education level -> school_level_en mapping
  const levelMap: Record<string, string> = {
    KG: "KINDERGARTEN",
    PRIMARY: "PRIMARY",
    SECONDARY: "SECONDARY",
  };
  const level = levelMap[filters.educationLevel];
  if (level) {
    conditions.push("school_level_en = ?");
    params.push(level);
  }

  // Free-text search across name and address
  if (filters.searchQuery.trim()) {
    conditions.push(
      "(name_en LIKE ? OR name_tc LIKE ? OR address_en LIKE ?)"
    );
    const q = `%${filters.searchQuery.trim()}%`;
    params.push(q, q, q);
  }

  // Multi-select chip filters
  if (filters.districts.length > 0) {
    const placeholders = filters.districts.map(() => "?").join(",");
    conditions.push(`district_en IN (${placeholders})`);
    params.push(...filters.districts);
  }

  if (filters.financeTypes.length > 0) {
    const placeholders = filters.financeTypes.map(() => "?").join(",");
    conditions.push(`finance_type_en IN (${placeholders})`);
    params.push(...filters.financeTypes);
  }

  if (filters.religions.length > 0) {
    const placeholders = filters.religions.map(() => "?").join(",");
    conditions.push(`religion_en IN (${placeholders})`);
    params.push(...filters.religions);
  }

  if (filters.sessions.length > 0) {
    const placeholders = filters.sessions.map(() => "?").join(",");
    conditions.push(`session_en IN (${placeholders})`);
    params.push(...filters.sessions);
  }

  if (filters.genders.length > 0) {
    const placeholders = filters.genders.map(() => "?").join(",");
    conditions.push(`students_gender_en IN (${placeholders})`);
    params.push(...filters.genders);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
}

/** Fetch paginated school list matching current filters. */
export async function getSchools(
  db: SQLiteDatabase,
  filters: K12FilterState,
  limit = 50,
  offset = 0
): Promise<School[]> {
  const { where, params } = buildWhereClause(filters);
  return db.getAllAsync<School>(
    `SELECT * FROM schools ${where} ORDER BY name_en LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

/** Fetch a single school by primary key. */
export async function getSchoolById(
  db: SQLiteDatabase,
  schoolNo: string
): Promise<School | null> {
  return db.getFirstAsync<School>(
    "SELECT * FROM schools WHERE school_no = ?",
    schoolNo
  );
}

/** Count schools matching current filters (for live filter count display). */
export async function getSchoolCount(
  db: SQLiteDatabase,
  filters: K12FilterState
): Promise<number> {
  const { where, params } = buildWhereClause(filters);
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM schools ${where}`,
    params
  );
  return row?.count ?? 0;
}

/** Fetch all schools with coordinates for map view. */
export async function getSchoolsForMap(
  db: SQLiteDatabase,
  filters: K12FilterState
): Promise<School[]> {
  const { where, params } = buildWhereClause(filters);
  const coordFilter = "latitude != 0 AND longitude != 0";
  const fullWhere = where
    ? `${where} AND ${coordFilter}`
    : `WHERE ${coordFilter}`;
  return db.getAllAsync<School>(
    `SELECT * FROM schools ${fullWhere}`,
    params
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/repositories/schoolRepository.ts
git commit -m "feat: add school repository with filtered queries, count, and map support"
```

---

### Task 8: HEI Repository

**Files:**
- Create: `src/repositories/heiRepository.ts`

- [ ] **Step 1: Create src/repositories/heiRepository.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";
import type { HeiInstitution } from "@/types/school";

/** Fetch paginated HEI list with optional search. */
export async function getInstitutions(
  db: SQLiteDatabase,
  searchQuery = "",
  limit = 50,
  offset = 0
): Promise<HeiInstitution[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (searchQuery.trim()) {
    conditions.push(
      "(facility_name_en LIKE ? OR facility_name_tc LIKE ? OR address_en LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q, q);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db.getAllAsync<HeiInstitution>(
    `SELECT * FROM hei_institutions ${where} ORDER BY facility_name_en LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

/** Fetch a single institution by primary key. */
export async function getInstitutionById(
  db: SQLiteDatabase,
  objectid: number
): Promise<HeiInstitution | null> {
  return db.getFirstAsync<HeiInstitution>(
    "SELECT * FROM hei_institutions WHERE objectid = ?",
    objectid
  );
}

/** Count institutions matching search. */
export async function getInstitutionCount(
  db: SQLiteDatabase,
  searchQuery = ""
): Promise<number> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (searchQuery.trim()) {
    conditions.push(
      "(facility_name_en LIKE ? OR facility_name_tc LIKE ? OR address_en LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q, q);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM hei_institutions ${where}`,
    params
  );
  return row?.count ?? 0;
}

/** Fetch all institutions with coordinates for map view. */
export async function getInstitutionsForMap(
  db: SQLiteDatabase
): Promise<HeiInstitution[]> {
  return db.getAllAsync<HeiInstitution>(
    "SELECT * FROM hei_institutions WHERE latitude != 0 AND longitude != 0"
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/repositories/heiRepository.ts
git commit -m "feat: add HEI repository with search and map queries"
```

---

### Task 9: Programme Repository

**Files:**
- Create: `src/repositories/programmeRepository.ts`

- [ ] **Step 1: Create src/repositories/programmeRepository.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";
import type { UgcProgramme } from "@/types/school";
import type { UniFilterState } from "@/types/filter";

function buildWhereClause(filters: UniFilterState): {
  where: string;
  params: (string | number)[];
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.programmeSearch.trim()) {
    conditions.push(
      "(programme_name_en LIKE ? OR programme_name_tc LIKE ?)"
    );
    const q = `%${filters.programmeSearch.trim()}%`;
    params.push(q, q);
  }

  if (filters.studyLevels.length > 0) {
    const placeholders = filters.studyLevels.map(() => "?").join(",");
    conditions.push(`level_of_study_en IN (${placeholders})`);
    params.push(...filters.studyLevels);
  }

  if (filters.modesOfStudy.length > 0) {
    const placeholders = filters.modesOfStudy.map(() => "?").join(",");
    conditions.push(`mode_of_study_en IN (${placeholders})`);
    params.push(...filters.modesOfStudy);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
}

/** Fetch paginated programme list matching filters. */
export async function getProgrammes(
  db: SQLiteDatabase,
  filters: UniFilterState,
  limit = 50,
  offset = 0
): Promise<UgcProgramme[]> {
  const { where, params } = buildWhereClause(filters);
  return db.getAllAsync<UgcProgramme>(
    `SELECT * FROM ugc_programmes ${where} ORDER BY university_en, programme_name_en LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

/** Fetch programmes for a specific university (institution detail screen). */
export async function getProgrammesByUniversity(
  db: SQLiteDatabase,
  universityEn: string,
  searchQuery = "",
  studyLevel = "",
  modeOfStudy = ""
): Promise<UgcProgramme[]> {
  const conditions: string[] = ["university_en = ?"];
  const params: (string | number)[] = [universityEn];

  if (searchQuery.trim()) {
    conditions.push(
      "(programme_name_en LIKE ? OR programme_name_tc LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q);
  }

  if (studyLevel) {
    conditions.push("level_of_study_en = ?");
    params.push(studyLevel);
  }

  if (modeOfStudy) {
    conditions.push("mode_of_study_en = ?");
    params.push(modeOfStudy);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  return db.getAllAsync<UgcProgramme>(
    `SELECT * FROM ugc_programmes ${where} ORDER BY programme_name_en`,
    params
  );
}

/** Count programmes matching filters (for live filter count display). */
export async function getProgrammeCount(
  db: SQLiteDatabase,
  filters: UniFilterState
): Promise<number> {
  const { where, params } = buildWhereClause(filters);
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ugc_programmes ${where}`,
    params
  );
  return row?.count ?? 0;
}

/** Count programmes for a specific university. */
export async function getProgrammeCountByUniversity(
  db: SQLiteDatabase,
  universityEn: string
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM ugc_programmes WHERE university_en = ?",
    universityEn
  );
  return row?.count ?? 0;
}

/** Get distinct universities (for the university-level discover list). */
export async function getDistinctUniversities(
  db: SQLiteDatabase
): Promise<{ university_en: string; university_tc: string; latitude: number; longitude: number }[]> {
  return db.getAllAsync(
    "SELECT DISTINCT university_en, university_tc, latitude, longitude FROM ugc_programmes ORDER BY university_en"
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/repositories/programmeRepository.ts
git commit -m "feat: add programme repository with university-grouped queries and filter support"
```

---

### Task 10: Calendar Repository

**Files:**
- Create: `src/repositories/calendarRepository.ts`

- [ ] **Step 1: Create src/repositories/calendarRepository.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";
import type { CalendarEvent, CalendarEventInput, EventCategory } from "@/types/calendar";

/** SQLite stores booleans as integers; this row type matches the raw DB row. */
interface CalendarEventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  category: string;
  school_no: string | null;
  reminder_enabled: number;
  is_seeded: number;
}

function mapRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    event_date: row.event_date,
    event_time: row.event_time,
    category: row.category as EventCategory,
    school_no: row.school_no,
    reminder_enabled: row.reminder_enabled === 1,
    is_seeded: row.is_seeded === 1,
  };
}

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Fetch events for a specific month. */
export async function getEventsByMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const rows = await db.getAllAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE event_date >= ? AND event_date < ? ORDER BY event_date, event_time",
    startDate,
    endDate
  );
  return rows.map(mapRow);
}

/** Fetch a single event by ID. */
export async function getEventById(
  db: SQLiteDatabase,
  id: string
): Promise<CalendarEvent | null> {
  const row = await db.getFirstAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE id = ?",
    id
  );
  return row ? mapRow(row) : null;
}

/** Create a new calendar event. Returns the generated UUID. */
export async function createEvent(
  db: SQLiteDatabase,
  input: CalendarEventInput
): Promise<string> {
  const id = generateId();
  await db.runAsync(
    `INSERT INTO calendar_events
       (id, title, description, event_date, event_time, category, school_no, reminder_enabled, is_seeded)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    id,
    input.title,
    input.description ?? null,
    input.event_date,
    input.event_time ?? null,
    input.category,
    input.school_no ?? null,
    input.reminder_enabled ? 1 : 0
  );
  return id;
}

/** Update an existing event. */
export async function updateEvent(
  db: SQLiteDatabase,
  id: string,
  input: CalendarEventInput
): Promise<void> {
  await db.runAsync(
    `UPDATE calendar_events
     SET title = ?, description = ?, event_date = ?, event_time = ?,
         category = ?, school_no = ?, reminder_enabled = ?
     WHERE id = ?`,
    input.title,
    input.description ?? null,
    input.event_date,
    input.event_time ?? null,
    input.category,
    input.school_no ?? null,
    input.reminder_enabled ? 1 : 0,
    id
  );
}

/** Delete a single event. */
export async function deleteEvent(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync("DELETE FROM calendar_events WHERE id = ?", id);
}

/** Delete all seeded demo events (used in Settings -> Clear Data). */
export async function deleteSeededEvents(
  db: SQLiteDatabase
): Promise<void> {
  await db.runAsync("DELETE FROM calendar_events WHERE is_seeded = 1");
}

/** Fetch all events that have reminders enabled (for scheduling notifications). */
export async function getEventsWithReminders(
  db: SQLiteDatabase
): Promise<CalendarEvent[]> {
  const rows = await db.getAllAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE reminder_enabled = 1 ORDER BY event_date"
  );
  return rows.map(mapRow);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/repositories/calendarRepository.ts
git commit -m "feat: add calendar repository with full CRUD and reminder queries"
```

---

### Task 11: Seed Logic

**Files:**
- Create: `src/db/seed.ts`

- [ ] **Step 1: Create src/db/seed.ts**

```ts
import type { SQLiteDatabase } from "expo-sqlite";
import type {
  School,
  HeiInstitution,
  UgcProgramme,
  RawSchool,
  RawHeiFeature,
  RawUgcFeature,
  GeoJsonCollection,
} from "@/types/school";
import {
  parseSchool,
  parseHeiInstitution,
  parseUgcProgramme,
} from "./parsers";

const SCHOOLS_API_URL =
  "http://www.edb.gov.hk/attachment/en/student-parents/sch-info/sch-search/sch-location-info/SCH_LOC_EDB.json";
const HEI_API_URL =
  "https://portal.csdi.gov.hk/server/services/common/edb_rcd_1629267205213_58940/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=ASFPS&outputFormat=geojson";
const UGC_API_URL =
  "https://portal.csdi.gov.hk/server/services/common/ugc_rcd_1665536012918_39544/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=geotagging&outputFormat=geojson";

export interface SeedProgress {
  phase: "schools" | "hei" | "ugc" | "done";
  message: string;
}

/** Check if the database has already been seeded. */
export async function isSeeded(db: SQLiteDatabase): Promise<boolean> {
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = ?",
      "last_seed_ts"
    );
    return row != null;
  } catch {
    return false;
  }
}

/**
 * Seed all three datasets into the database.
 * Schools are fetched from the live EDB API (requires connectivity).
 * HEI and UGC fall back to bundled assets on fetch failure.
 */
export async function seedDatabase(
  db: SQLiteDatabase,
  onProgress?: (progress: SeedProgress) => void
): Promise<void> {
  onProgress?.({ phase: "schools", message: "Fetching school data..." });
  const schools = await fetchAndParseSchools();

  onProgress?.({ phase: "hei", message: "Fetching institution data..." });
  const institutions = await fetchAndParseHei();

  onProgress?.({ phase: "ugc", message: "Fetching programme data..." });
  const programmes = await fetchAndParseUgc();

  onProgress?.({ phase: "schools", message: "Saving school data..." });
  await insertSchools(db, schools);

  onProgress?.({ phase: "hei", message: "Saving institution data..." });
  await insertInstitutions(db, institutions);

  onProgress?.({ phase: "ugc", message: "Saving programme data..." });
  await insertProgrammes(db, programmes);

  // Write seed metadata
  const now = new Date().toISOString();
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "last_seed_ts",
    now
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "schools_count",
    String(schools.length)
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "hei_count",
    String(institutions.length)
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "ugc_count",
    String(programmes.length)
  );

  onProgress?.({ phase: "done", message: "Data loaded successfully" });
}

// --- Fetch & Parse ---

async function fetchAndParseSchools(): Promise<School[]> {
  const response = await fetch(SCHOOLS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch schools: HTTP ${response.status}`);
  }
  const raw: RawSchool[] = await response.json();
  return raw.map(parseSchool);
}

async function fetchAndParseHei(): Promise<HeiInstitution[]> {
  try {
    const response = await fetch(HEI_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson: GeoJsonCollection<RawHeiFeature> = await response.json();
    return geojson.features.map(parseHeiInstitution);
  } catch {
    return loadBundledHei();
  }
}

async function fetchAndParseUgc(): Promise<UgcProgramme[]> {
  try {
    const response = await fetch(UGC_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson: GeoJsonCollection<RawUgcFeature> = await response.json();
    return geojson.features.map(parseUgcProgramme);
  } catch {
    return loadBundledUgc();
  }
}

// --- Bundled Asset Fallbacks ---

function loadBundledHei(): HeiInstitution[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const geojson = require("../../assets/data/Higher-Education-Institutions.json") as GeoJsonCollection<RawHeiFeature>;
  return geojson.features.map(parseHeiInstitution);
}

function loadBundledUgc(): UgcProgramme[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const geojson = require("../../assets/data/List-of-UGC-funded-Programmes.json") as GeoJsonCollection<RawUgcFeature>;
  return geojson.features.map(parseUgcProgramme);
}

// --- Batch Insert ---

async function insertSchools(
  db: SQLiteDatabase,
  schools: School[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO schools (
    school_no, name_en, name_tc, category_en, category_tc,
    address_en, address_tc, school_level_en, school_level_tc,
    district_en, district_tc, finance_type_en, finance_type_tc,
    religion_en, religion_tc, session_en, session_tc,
    students_gender_en, students_gender_tc,
    telephone, fax, website, latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const s of schools) {
        await stmt.executeAsync([
          s.school_no, s.name_en, s.name_tc, s.category_en, s.category_tc,
          s.address_en, s.address_tc, s.school_level_en, s.school_level_tc,
          s.district_en, s.district_tc, s.finance_type_en, s.finance_type_tc,
          s.religion_en, s.religion_tc, s.session_en, s.session_tc,
          s.students_gender_en, s.students_gender_tc,
          s.telephone, s.fax, s.website, s.latitude, s.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

async function insertInstitutions(
  db: SQLiteDatabase,
  institutions: HeiInstitution[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO hei_institutions (
    objectid, facility_name_en, facility_name_tc,
    address_en, address_tc, telephone, fax, email, website,
    latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const i of institutions) {
        await stmt.executeAsync([
          i.objectid, i.facility_name_en, i.facility_name_tc,
          i.address_en, i.address_tc, i.telephone, i.fax, i.email, i.website,
          i.latitude, i.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

async function insertProgrammes(
  db: SQLiteDatabase,
  programmes: UgcProgramme[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO ugc_programmes (
    objectid, university_en, university_tc,
    programme_name_en, programme_name_tc,
    level_of_study_en, level_of_study_tc,
    mode_of_study_en, mode_of_study_tc,
    latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const p of programmes) {
        await stmt.executeAsync([
          p.objectid, p.university_en, p.university_tc,
          p.programme_name_en, p.programme_name_tc,
          p.level_of_study_en, p.level_of_study_tc,
          p.mode_of_study_en, p.mode_of_study_tc,
          p.latitude, p.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat: add seed logic with API fetch, bundled fallbacks, and batch insert"
```

---

### Task 12: End-to-End Verification

**Files:**
- Modify: `app/index.tsx` (temporary test harness)

- [ ] **Step 1: Create a temporary test harness in app/index.tsx**

Replace `app/index.tsx` with a minimal screen that exercises the full data pipeline:

```tsx
import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { DATABASE_NAME } from "@/db/client";
import { createTables } from "@/db/schema";
import { migrateIfNeeded } from "@/db/migrations";
import { isSeeded, seedDatabase, type SeedProgress } from "@/db/seed";
import { getSchoolCount } from "@/repositories/schoolRepository";
import { getInstitutionCount } from "@/repositories/heiRepository";
import { getProgrammeCount } from "@/repositories/programmeRepository";

export default function TestHarness() {
  const [status, setStatus] = useState("Initializing...");
  const [counts, setCounts] = useState({ schools: 0, hei: 0, ugc: 0 });

  useEffect(() => {
    (async () => {
      try {
        const db = await openDatabaseAsync(DATABASE_NAME);
        setStatus("Creating tables...");
        await createTables(db);
        await migrateIfNeeded(db);

        const seeded = await isSeeded(db);
        if (!seeded) {
          await seedDatabase(db, (p: SeedProgress) => {
            setStatus(`${p.phase}: ${p.message}`);
          });
        }

        const schoolCount = await getSchoolCount(db, {
          educationLevel: "PRIMARY",
          searchQuery: "",
          districts: [],
          financeTypes: [],
          religions: [],
          sessions: [],
          genders: [],
        });

        const heiCount = await getInstitutionCount(db);

        const ugcCount = await getProgrammeCount(db, {
          scope: "UGC",
          studyLevels: [],
          modesOfStudy: [],
          programmeSearch: "",
          districts: [],
        });

        setCounts({ schools: schoolCount, hei: heiCount, ugc: ugcCount });
        setStatus("Seed complete - data layer verified");
      } catch (err) {
        setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, []);

  return (
    <ScrollView className="flex-1 bg-bg-light p-4 pt-16">
      <Text className="text-2xl font-bold text-primary mb-4">
        Data Layer Verification
      </Text>
      <Text className="text-base text-text-secondary mb-6">{status}</Text>
      <View className="bg-surface-light rounded-xl p-4 gap-3">
        <Text className="text-lg text-text-primary">
          Primary Schools: {counts.schools}
        </Text>
        <Text className="text-lg text-text-primary">
          HEI Institutions: {counts.hei}
        </Text>
        <Text className="text-lg text-text-primary">
          UGC Programmes: {counts.ugc}
        </Text>
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Run on Android emulator and verify**

```bash
npx expo run:android
```

Expected output on device:
- Status progresses through: "Creating tables..." -> "schools: Fetching school data..." -> ... -> "Seed complete - data layer verified"
- Primary Schools: ~800+ (depends on EDB data for PRIMARY level)
- HEI Institutions: 122
- UGC Programmes: ~1031

If the schools API is unreachable, you will see an error. This is expected -- the EDB API requires HTTP connectivity and `usesCleartextTraffic: true` in app.json.

- [ ] **Step 3: Run parser tests to confirm everything passes**

```bash
npx jest --verbose
```

Expected: All parser tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/index.tsx
git commit -m "test: add temporary data layer verification harness"
```

---

## Subsequent Plans

This completes Plan 1 (Foundation & Data Layer). The following plans build on this foundation:

### Plan 2: State Management, Providers & Navigation
- Zustand stores: `useFilterStore`, `useUniFilterStore`, `useCompareStore`, `useShortlistStore`, `useStatusTrackerStore`
- MMKV persistence middleware for shortlist and status tracker
- `ThemeProvider` (light/dark/system with MMKV persistence)
- `LanguageProvider` (EN/TC with i18n JSON files and MMKV persistence)
- `DatabaseProvider` (seed gate, loading state, error handling)
- Root layout with all providers nested
- Expo Router 5-tab bottom navigator
- Stack screens for detail routes

### Plan 3: Discover Tab & Filter System
- `EducationLevelTabs`, `SearchBar`, `ActiveFilterChips` components
- `SchoolCard`, `InstitutionCard` (React.memo, FlashList v2)
- `FilterSheet` (single reusable @gorhom/bottom-sheet v5)
- `FilterChip`, `Badge`, `BackToTopButton`, `EmptyState`, `SkeletonPlaceholder`
- `useSchools`, `useInstitutions`, `useSchoolCount` hooks (300ms debounce)
- Live results count in filter sheet

### Plan 4: Detail Screens & Comparison
- `school/[id].tsx` -- K-12 school detail (hero banner, tabs, contact)
- `institution/[id].tsx` -- HEI/university detail (programmes tab for UGC)
- `HeroBanner`, `QuickInfoStrip`, `AccordionSection`, `ContactRow`
- `compare/index.tsx` -- side-by-side comparison (2-3 schools)
- `ComparisonTable`, `ComparisonCell`, `CompareBar`

### Plan 5: Map View
- Map screen with `react-native-maps` and colour-coded pins
- `SchoolPin`, `MapPreviewSheet` components
- Education level layer switching
- Marker clustering for dense areas
- Floating controls (layer switcher, my location)
- Search + filter integration from map

### Plan 6: Shortlist, Calendar & Settings
- Shortlist tab with `StatusStepper` (4 stages via MMKV)
- Calendar tab with `CalendarGrid`, `EventCard`, `EventForm`
- Event CRUD screens (`event/[id].tsx`, `event/create.tsx`)
- Demo event seed data (15-20 bundled events)
- Push notifications via `expo-notifications`
- Calendar export via `expo-calendar`
- Settings tab (language, theme, font size, notifications, data management)
- `OfflineBanner` with NetInfo integration
