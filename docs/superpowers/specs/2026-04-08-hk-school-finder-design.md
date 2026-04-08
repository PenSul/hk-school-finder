# HK School Finder -- Design Specification

**Date:** 2026-04-08
**Status:** Approved
**Repo:** hk-school-finder (GitHub, to be created)

A React Native mobile application displaying Hong Kong school information -- kindergarten through university/HEI -- built with Expo SDK 55, targeting Android (development build on emulator).

---

## 1. Data Sources

Three government open data APIs. All read-only, fetched once on first launch, stored locally in SQLite.

| Dataset                             | API URL                                                                                                                                                                      | Records | Scope                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------- |
| EDB School Location & Information   | `http://www.edb.gov.hk/attachment/en/student-parents/sch-info/sch-search/sch-location-info/SCH_LOC_EDB.json`                                                                 | ~2,500+ | All K-12 schools        |
| ASFPS Higher Education Institutions | `https://portal.csdi.gov.hk/server/services/common/edb_rcd_1629267205213_58940/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=ASFPS&outputFormat=geojson`      | 122     | All HEIs                |
| UGC-Funded Programmes               | `https://portal.csdi.gov.hk/server/services/common/ugc_rcd_1665536012918_39544/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=geotagging&outputFormat=geojson` | ~1,031  | 8 UGC universities only |

**Data limitations -- fields that do NOT exist and must NOT appear in UI:**
Tuition fees, facilities, student numbers, student-teacher ratios, JUPAS routes, rankings, year founded, principal name, intake numbers, School Net boundaries.

**Development fixture:** `assets/data/School-Location-and-Information.json` (7-record sample, 12K). Full dataset fetched from live API at runtime. Two other datasets cached at `assets/data/Higher-Education-Institutions.json` and `assets/data/List-of-UGC-funded-Programmes.json`.

---

## 2. Tech Stack

| Concern                 | Solution                                   | Notes                                  |
| ----------------------- | ------------------------------------------ | -------------------------------------- |
| Framework               | Expo SDK 55                                | React Native 0.83, React 19.2          |
| Language                | TypeScript                                 | Strict mode                            |
| JS Engine               | Hermes                                     | Default in SDK 55                      |
| Navigation              | Expo Router                                | File-based routing                     |
| Gestures                | react-native-gesture-handler v2            |                                        |
| Animations              | react-native-reanimated v4                 | Ships with SDK 55; New Arch only       |
| Bottom Sheet            | @gorhom/bottom-sheet v5                    | Compatible with SDK 55 + expo-router   |
| List Rendering          | @shopify/flash-list v2                     | New Arch only; no estimatedItemSize    |
| Data Fetching           | @tanstack/react-query                      | Seed lifecycle orchestration ONLY      |
| Local Database          | expo-sqlite                                | Primary data store; JSI-based sync API |
| User Preferences        | react-native-mmkv                          | Small values only                      |
| State Management        | Zustand                                    | Filter state, compare, education level |
| Image Caching           | expo-image                                 |                                        |
| Maps                    | react-native-maps                          |                                        |
| Localisation            | expo-localization + custom hook + JSON map |                                        |
| Offline Detection       | @react-native-community/netinfo            |                                        |
| Push Notifications      | expo-notifications                         |                                        |
| Calendar Export         | expo-calendar                              |                                        |
| Crash & Perf Monitoring | @sentry/react-native                       |                                        |
| Styling                 | NativeWind v4 (tailwindcss ^3.4.x, NOT v4) |                                        |
| UI Components           | gluestack-ui v3                            | Copy-paste; NativeWind-based           |

### Babel Configuration

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [],
  };
};
```

Do NOT add `react-native-worklets/plugin` separately -- it is bundled inside reanimated v4.

---

## 3. Architecture

### 3.1 Data Flow

```
External APIs (3)
  |  fetch on first launch
  v
Seed Layer (TanStack Query orchestrates)
  |  parse JSON, batch INSERT
  v
expo-sqlite (primary data store)
  - schools table
  - hei_institutions table
  - ugc_programmes table
  - calendar_events table
  - db_metadata table
  |
  v
Repository Layer (encapsulates all SQL)
  - schoolRepository.ts
  - heiRepository.ts
  - programmeRepository.ts
  - calendarRepository.ts
  |
  v
Custom Hooks (bridge repos to components)
  |
  v
UI Components
```

**MMKV** stores only: language preference, theme preference, shortlist school IDs (array), application status tracker stages, notification preferences.

**TanStack Query** orchestrates the fetch-and-seed lifecycle with `staleTime: Infinity` for the "is DB seeded?" check. Actual data reads come from SQLite via custom hooks, not from TanStack Query's cache.

### 3.2 State Management

| Store                 | Library        | Persisted? | Contents                                                                                  |
| --------------------- | -------------- | ---------- | ----------------------------------------------------------------------------------------- |
| useFilterStore        | Zustand        | No         | educationLevel, districts[], financeTypes[], religion[], session[], gender[], searchQuery |
| useUniFilterStore     | Zustand        | No         | scope (UGC/All), studyLevel[], modeOfStudy[], programmeSearch                             |
| useCompareStore       | Zustand        | No         | selectedSchools[] (max 3), add/remove/clear                                               |
| useShortlistStore     | Zustand + MMKV | Yes        | shortlistedIds[] (SCHOOL_NO / OBJECTID)                                                   |
| useStatusTrackerStore | Zustand + MMKV | Yes        | per-school stage (Interested/Visited/Applied/Result)                                      |
| ThemeProvider         | React Context  | MMKV       | colorScheme (light/dark/system), tokens                                                   |
| LanguageProvider      | React Context  | MMKV       | locale (en/tc), t() translation function                                                  |
| DatabaseProvider      | React Context  | No         | isSeeded, isSeeding, seedError                                                            |

### 3.3 Database Schema

#### schools (K-12 from EDB API)

| Column             | Type          | Notes   |
| ------------------ | ------------- | ------- |
| school_no          | TEXT NOT NULL | **PK**  |
| name_en            | TEXT          |         |
| name_tc            | TEXT          |         |
| category_en        | TEXT          |         |
| category_tc        | TEXT          |         |
| address_en         | TEXT          |         |
| address_tc         | TEXT          |         |
| school_level_en    | TEXT          | **IDX** |
| school_level_tc    | TEXT          |         |
| district_en        | TEXT          | **IDX** |
| district_tc        | TEXT          |         |
| finance_type_en    | TEXT          | **IDX** |
| finance_type_tc    | TEXT          |         |
| religion_en        | TEXT          | **IDX** |
| religion_tc        | TEXT          |         |
| session_en         | TEXT          | **IDX** |
| session_tc         | TEXT          |         |
| students_gender_en | TEXT          | **IDX** |
| students_gender_tc | TEXT          |         |
| telephone          | TEXT          |         |
| fax                | TEXT          |         |
| website            | TEXT          |         |
| latitude           | REAL          |         |
| longitude          | REAL          |         |

#### hei_institutions (122 from ASFPS API)

| Column           | Type             | Notes   |
| ---------------- | ---------------- | ------- |
| objectid         | INTEGER NOT NULL | **PK**  |
| facility_name_en | TEXT             | **IDX** |
| facility_name_tc | TEXT             |         |
| address_en       | TEXT             |         |
| address_tc       | TEXT             |         |
| telephone        | TEXT             |         |
| fax              | TEXT             |         |
| email            | TEXT             |         |
| website          | TEXT             |         |
| latitude         | REAL             |         |
| longitude        | REAL             |         |

#### ugc_programmes (~1,031 from UGC API)

| Column            | Type             | Notes   |
| ----------------- | ---------------- | ------- |
| objectid          | INTEGER NOT NULL | **PK**  |
| university_en     | TEXT             | **IDX** |
| university_tc     | TEXT             |         |
| programme_name_en | TEXT             | **IDX** |
| programme_name_tc | TEXT             |         |
| level_of_study_en | TEXT             | **IDX** |
| level_of_study_tc | TEXT             |         |
| mode_of_study_en  | TEXT             | **IDX** |
| mode_of_study_tc  | TEXT             |         |
| latitude          | REAL             |         |
| longitude         | REAL             |         |

#### calendar_events (user-created + seeded demo data)

| Column           | Type              | Notes                                            |
| ---------------- | ----------------- | ------------------------------------------------ |
| id               | TEXT NOT NULL     | **PK**, UUID                                     |
| title            | TEXT NOT NULL     | User-entered name                                |
| description      | TEXT              | Optional notes                                   |
| event_date       | TEXT NOT NULL     | **IDX**, ISO 8601 date                           |
| event_time       | TEXT              | Optional HH:MM                                   |
| category         | TEXT NOT NULL     | **IDX**, one of: poa, kg, open_day, sspa, custom |
| school_no        | TEXT              | Optional FK to schools                           |
| reminder_enabled | INTEGER DEFAULT 0 | Boolean flag                                     |
| is_seeded        | INTEGER DEFAULT 0 | 1 = demo data, 0 = user-created                  |

#### db_metadata (seed state tracking)

| Column | Type          | Notes                                        |
| ------ | ------------- | -------------------------------------------- |
| key    | TEXT NOT NULL | **PK**, e.g. 'schools_count', 'last_seed_ts' |
| value  | TEXT NOT NULL | Record count or ISO timestamp                |

**Notes:**

- All column names are snake_case, mapped from API's UPPER_CASE during seeding.
- All bilingual fields use consistent `_en`/`_tc` suffix pattern.
- Indexes on `_en` columns only (filtering always queries EN; TC is display-only).
- No foreign keys between school tables -- the 3 datasets are independent.
- UGC programmes link to universities by name, not by ID.
- Text columns handle flexible API values (e.g. "NOT APPLICABLE" vs empty). Normalization happens at repository layer.

---

## 4. Navigation & Screen Structure

### 4.1 Expo Router File Tree

```
app/
  _layout.tsx              -- root layout (providers, splash screen gate)
  (tabs)/
    _layout.tsx            -- 5-tab bottom navigator
    discover/
      index.tsx            -- school list + search + filters
    map/
      index.tsx            -- map view with pins
    shortlist/
      index.tsx            -- saved schools + status tracker
    calendar/
      index.tsx            -- calendar grid + events list + FAB
    settings/
      index.tsx            -- preferences + data management
  school/
    [id].tsx               -- K-12 school detail (stack screen)
  institution/
    [id].tsx               -- HEI/university detail (stack screen)
  compare/
    index.tsx              -- side-by-side comparison (stack screen)
  event/
    [id].tsx               -- event detail / edit (stack screen)
    create.tsx             -- new event form (stack screen)
```

### 4.2 Navigation Flows

**From Discover:** Tap card -> school/[id] or institution/[id]. Tap "Compare Selected" bar -> compare/. Tap filter button -> FilterSheet overlay. "View on Map" from detail -> map tab with pin focused.

**From Map:** Tap pin -> MapPreviewSheet (low snap). "View Profile" -> school/[id] or institution/[id]. Tap filter -> FilterSheet.

**From Shortlist:** Tap card -> detail screen. Tap "Compare Selected" -> compare/. Tap status stage -> inline MMKV update.

**From Calendar:** Tap event -> event/[id]. Tap "+" FAB -> event/create. "Add to Calendar" -> expo-calendar system intent. Bell icon -> expo-notifications schedule.

### 4.3 Overlay Components (not routes)

- **FilterSheet** -- single reusable @gorhom/bottom-sheet v5 component. Snap points at 50% and 92%. Conditionally renders sections by education level. Used by Discover and Map.
- **MapPreviewSheet** -- compact bottom sheet on pin tap (~220pt snap). Shows school image, name EN/TC, heart icon, finance badges, address, and two CTAs: "View Profile" (navigates to detail) + "Directions" (opens native maps).
- **CompareBar** -- sticky bar above bottom nav. Visible when 2-3 schools selected. Animates in/out with Reanimated.
- **OfflineBanner** -- non-blocking top banner when NetInfo detects no connectivity.

### 4.4 Bottom Navigation

5 tabs: **Discover**, **Map**, **Shortlist**, **Calendar**, **Settings**. All touch targets >= 44x44 pt. Tab bar animates downward out of view when FilterSheet is open. Uses react-native-safe-area-context for insets.

---

## 5. Project Structure

```
src/
  db/
    schema.ts              -- CREATE TABLE statements
    seed.ts                -- fetch APIs + batch INSERT
    client.ts              -- expo-sqlite instance
    migrations.ts          -- version upgrades if needed
  repositories/
    schoolRepository.ts    -- K-12 queries
    heiRepository.ts       -- HEI queries
    programmeRepository.ts -- UGC programme queries
    calendarRepository.ts  -- events CRUD
  stores/
    useFilterStore.ts      -- K-12 filter state (Zustand)
    useUniFilterStore.ts   -- university filter state (Zustand)
    useCompareStore.ts     -- comparison selections (Zustand)
    useShortlistStore.ts   -- MMKV-persisted shortlist (Zustand)
    useStatusTrackerStore.ts -- MMKV-persisted stages (Zustand)
  providers/
    ThemeProvider.tsx       -- dark/light + colour tokens
    LanguageProvider.tsx    -- i18n context + t()
    DatabaseProvider.tsx    -- seed gate + loading state
  hooks/
    useSchools.ts          -- filtered school list from repo
    useInstitutions.ts     -- filtered HEI list
    useProgrammes.ts       -- filtered programme list
    useSchoolCount.ts      -- debounced COUNT query (300ms)
    useCalendarEvents.ts   -- events by month
    useNetworkStatus.ts    -- NetInfo wrapper
    useReducedMotion.ts    -- accessibility check
  components/
    shared/
      SchoolCard.tsx       -- K-12 card (React.memo)
      InstitutionCard.tsx  -- HEI card (React.memo)
      FilterSheet.tsx      -- single reusable filter overlay
      FilterChip.tsx       -- colour-coded pill
      Badge.tsx            -- finance type badge
      CompareBar.tsx       -- sticky comparison bar
      BackToTopButton.tsx  -- floating scroll button
      OfflineBanner.tsx    -- connectivity warning
      EmptyState.tsx       -- reusable empty view
      SkeletonPlaceholder.tsx -- loading skeleton
    discover/
      EducationLevelTabs.tsx
      SearchBar.tsx
      ActiveFilterChips.tsx
    map/
      MapPreviewSheet.tsx
      SchoolPin.tsx
    shortlist/
      StatusStepper.tsx
    calendar/
      CalendarGrid.tsx
      EventCard.tsx
      EventForm.tsx
    comparison/
      ComparisonTable.tsx
      ComparisonCell.tsx
    detail/
      HeroBanner.tsx
      QuickInfoStrip.tsx
      AccordionSection.tsx
      ContactRow.tsx
  constants/
    colors.ts              -- theme tokens (light + dark)
    financeTypes.ts        -- badge colour map
    districts.ts           -- 18 HK districts EN/TC
    religions.ts           -- religion options EN/TC
    eventCategories.ts     -- calendar colour map
  i18n/
    en.json                -- English translations
    tc.json                -- Traditional Chinese translations
  types/
    school.ts              -- School, HEI, Programme types
    filter.ts              -- filter state types
    calendar.ts            -- CalendarEvent type
```

**Principles:** Route files in `app/` stay thin -- they compose components from `src/`. Feature-grouped components under `src/components/`. Cross-cutting data layer (`db/`, `repositories/`, `stores/`, `hooks/`) at top level.

---

## 6. UI/UX Design

### 6.1 Visual Design

From Design.txt reference (not pixel-perfect -- directional):

**Palette:**

- Primary: Deep Indigo `#1E3A5F`
- Accent/CTA: Warm Amber `#F59E0B`
- Background (light): Off-white `#F8FAFC`
- Surface (light): Pure white `#FFFFFF`
- Text primary: Dark slate `#1E293B`
- Text secondary: Medium slate `#64748B`
- Hairline borders: `#E2E8F0`

**Finance Type Badge Colours:**
| Type | Colour | Hex |
|---|---|---|
| Government | Indigo | #1E3A5F |
| Aided | Teal | #0D9488 |
| DSS | Purple | #7C3AED |
| ESF | Sky | #0284C7 |
| Private | Slate | #64748B |
| Caput | Orange | #EA580C |
| UGC-funded | Gold | #D97706 |

**Typography:** SF Pro Display / Roboto (EN), Noto Sans TC (Chinese). Body 15sp, Headings 20-24sp, Captions 12sp. Dynamic font scaling supported.

**Layout:** Card corners 12pt, button corners 8pt. Subtle drop shadows on cards. Touch targets >= 44x44pt minimum.

### 6.2 Dark Mode

Full system-level dark mode support via `Appearance.getColorScheme()` + manual override in Settings (Light / Dark / System). React Context-based ThemeProvider with defined colour-token system. Every component references tokens, not raw values. Colour contrast >= 4.5:1 (normal text) and >= 3:1 (large text) in both modes.

### 6.3 Language Toggle

English and Traditional Chinese. `expo-localization` reads device locale. Custom hook backed by JSON translation maps (`src/i18n/en.json`, `src/i18n/tc.json`) and React Context for runtime switching without app restart. Language preference persisted in MMKV. All API fields with `_EN`/`_TC` variants map accordingly.

### 6.4 Micro-animations

All via react-native-reanimated v4:

- Spring-based heart scale on shortlist "Like"
- Colour interpolation on filter chip activation
- Checkmark pop-in on compare selection
- `withTiming` height transition on accordion expand/collapse
- Bottom nav slide-out when FilterSheet opens
- CompareBar animate in/out

All animations respect `useReducedMotion()`, falling back to instant state change.

---

## 7. Screens & Features

### 7.1 Discover Tab

- Horizontal scrollable education level pills: KG, Primary, Secondary, University
- Search bar with predictive autocomplete (SQL `LIKE '%query%'`, 300ms debounce, FlashList v2)
- Filter button with amber dot badge when filters active
- Active filter chips row (dismissible)
- Results count label (e.g. "42 Schools Found")
- School card list (FlashList v2, React.memo cards)
- Back to Top floating button (appears after 1 viewport scroll, positioned at bottom: navBarHeight + safeAreaInset + 16, right: 16)

### 7.2 Filter System

Single `<FilterSheet>` component conditionally rendering sections by education level:

**Shared sections (always mounted):** District chips (18 HK districts), Religion chips.

**Kindergarten:** Finance Type (KES Subsidised / Private Independent). Session (AM, PM, Whole Day -- no Evening).

**Primary:** School Type (Government, Aided, DSS, ESF, Caput, Private). Gender (Co-Ed, Boys', Girls'). Session (AM, PM, Whole Day).

**Secondary:** Same as Primary + Session includes Evening.

**University:** Scope toggle (UGC-funded 8 universities / All HEIs 122 institutions). Level of Study -- UGC only (Sub-degree, Undergraduate, Taught Postgraduate, Research Postgraduate). Mode of Study -- UGC only (Full-time matches Full-time + Short Full-time; Part-time matches Part-time + Part-time evening). Programme Name Search -- UGC only (SQL LIKE, 300ms debounce). Level/Mode/Programme sections greyed out when "All HEI" scope selected.

**Live results count:** "Show 42 Schools" button updates via debounced SQL COUNT query (300ms).

**Sticky Clear All:** Pinned at top of filter overlay + persistent badge on filter button when any filter active.

### 7.3 School Detail (K-12)

- Hero banner (gradient, school name EN + TC, finance badge, "Compare +" pill)
- Quick info strip (3 tiles: Gender, Session, District)
- Tabs: Overview / Contact
- **Overview:** Accordion sections for School Information (Category, Finance Type, School Level), Religion, Address (EN + TC, "View on Map" link)
- **Contact:** Telephone, Fax, Website as tappable rows. Null fields show greyed "Not available" (not hidden)
- Bottom sticky: "View on Map" (outlined) + "Add to Shortlist" (filled amber)

**Prohibited accordions:** No fees, facilities, intake numbers, student-teacher ratios.

### 7.4 Institution Detail (HEI / University)

- Hero banner (gradient, institution name EN + TC, "UGC" gold badge or "HEI" slate badge, "Compare +" pill)
- Quick info strip (2-3 tiles: Address summary, Telephone if available, Website if available)
- **For non-UGC HEIs:** Accordion sections for Address (EN + TC), Contact (Tel, Fax, Email, Website). Null fields show greyed "Not available" (not hidden). No programme data available.
- **For UGC universities:** Same as non-UGC plus: Programme count summary tile, expandable programme list grouped by Level of Study, each programme showing Mode of Study. Programme list is searchable with text input (SQL LIKE, 300ms debounce against ugc_programmes table filtered by university_en).
- Bottom sticky: "View on Map" (outlined) + "Add to Shortlist" (filled amber)

### 7.5 Side-by-Side Comparison

Full-screen, accepts 2-3 schools in aligned columns. Horizontally scrollable table.

**K-12 rows:** School Category, Finance Type, Gender, Session, District, Religion.
**University rows:** Institution Name (EN/TC), Address, Telephone, Website, Programme count (UGC only).
**NOT included:** Fees, facilities, student numbers, ratios.

Cells with differing values highlighted with subtle amber tint `#FEF3C7`.

Compare toggle (checkbox) on each school card. Sticky "Compare Selected (N)" bar animates above bottom nav. Selecting a 4th school deselects the oldest with shake animation.

### 7.6 Map View

Full-screen map with colour-coded pins by finance type (pins show school building icons with labels). Education level pills (KG, Primary, Secondary, Post-Sec) control visible layer. Search bar + filter button floated at top.

**Floating controls (right side):**
- Layer button (top-right, stacked layers icon) -- switches map type (standard / satellite / terrain)
- My Location button (bottom-right, crosshair icon) -- centres map on user's location

No zoom +/- buttons -- native pinch-to-zoom gesture is sufficient.

**Pin tap -> MapPreviewSheet** (low snap ~220pt):
- School image thumbnail (if available via expo-image), school name EN + TC, heart/shortlist icon
- Finance type badges (colour-coded)
- Address (truncated single line)
- Two action buttons: **"View Profile"** (filled, navigates to detail screen) + **"Directions"** (outlined, opens native maps app for navigation to school coordinates via `Linking.openURL`)

Cluster markers for dense areas.

### 7.7 Shortlist Tab

Saved schools with horizontal status stepper (4 stages: Interested -> Open Day Visited -> Applied -> Result Received). Active stage amber, inactive grey. All data in MMKV. Compare bar visible when 2-3 selected.

Empty state: illustration + "No Schools Shortlisted Yet" + "Explore Schools" CTA.

### 7.8 Calendar Tab

User-created personal calendar for tracking admission deadlines.

- Month strip (horizontal scrollable pills)
- Calendar grid (7-column, dots on days with events, today highlighted)
- Events list below calendar
- Event cards with colour-coded left stripe (poa: indigo, kg: teal, open_day: amber, sspa: coral, custom: slate)
- FAB "+" to create new event
- Each event: title, date/time, category badge, bell icon (set reminder), calendar export icon
- Full CRUD: create, view, edit, delete events
- Seeded with ~15-20 demo events from bundled JSON on first launch
- Push notifications via expo-notifications for opt-in reminders
- "Add to Calendar" export via expo-calendar

### 7.9 Settings Tab

- **Display:** Language picker (English / Traditional Chinese), Appearance (Light / Dark / System 3-segment), Font Size slider (Small / Default / Large)
- **Notifications:** Admission Reminders toggle, Open Day Alerts toggle
- **Data:** Cached Data (last updated timestamp, tap to refresh), Clear All Data (destructive, confirmation required)
- **About:** Data Sources (DATA.GOV.HK attribution), App Version

---

## 8. Performance & Architecture Constraints

### 8.1 Data Persistence

- Do NOT statically bundle the full School Location JSON (120,000+ lines).
- Do NOT store large datasets in MMKV.
- SQLite is the primary data store. Fetch-on-first-launch, seed once, query locally thereafter.
- Background update check on subsequent launches (compare record count via db_metadata).
- If first launch with no connectivity: full-screen "Connect to the internet to download school data" prompt.

### 8.2 Rendering

- FlashList v2 for all lists (New Architecture, no estimatedItemSize needed).
- React.memo on card components, useCallback for stable callbacks, useMemo for derived filter results.
- InteractionManager.runAfterInteractions() to defer heavy work until after navigation animations.

### 8.3 Anticipatory Loading

- Preload fonts (expo-font) and icon sets during splash screen (expo-splash-screen).
- Heavy screens (Map, Comparison) code-split via Expo Router and loaded lazily with React.lazy + Suspense + skeleton placeholder.

### 8.4 Offline Mode

- All school data in SQLite after first successful fetch -- app works fully offline for browse/filter/search.
- When offline: non-blocking top banner. Users can browse cached data, apply filters, access shortlist and status tracker, view cached calendar events.
- Network-dependent actions (external links, initial data fetch) show "Not available offline" inline message.

### 8.5 Bundle Hygiene

- Hermes engine (default SDK 55).
- Audit with `npx expo-bundle-visualizer`.
- Metro handles tree-shaking natively.

### 8.6 Monitoring

- @sentry/react-native for production crash reporting and performance monitoring.
- Development: React DevTools Profiler + React Native 0.83 Performance Tracing panel.
- Do NOT use @shopify/react-native-performance (deprecated).

---

## 9. Accessibility (WCAG 2.1 AA)

- All touch targets >= 44x44 pt.
- `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` on all interactive elements.
- `allowFontScaling={true}` on all Text components.
- All animations respect `useReducedMotion()`.
- Colour contrast >= 4.5:1 (normal text) and >= 3:1 (large text) in both light and dark modes.

---

## 10. Decisions Made During Brainstorming

| Decision                   | Resolution                      | Rationale                                                                                                                |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| School Net feature         | **Dropped**                     | Not in API data; removes complexity from filters and map without losing functionality                                    |
| Calendar tab data          | **User CRUD + demo seed**       | No admission event API exists. Personal calendar with full create/edit/delete. Bundled demo JSON for course project demo |
| In-memory state management | **Zustand**                     | Selector-based re-renders ideal for complex filter state across 4 education levels. MMKV middleware for persisted slices |
| Folder organization        | **Feature-based**               | Components grouped by feature; cross-cutting data layer at top level                                                     |
| DB access pattern          | **Repository layer**            | Thin repo modules encapsulate all SQL. Hooks consume repos, components consume hooks                                     |
| App/repo name              | **hk-school-finder**            | New GitHub repo                                                                                                          |
| Schema TC columns          | **Consistent \_en/\_tc suffix** | All bilingual fields use \_en/\_tc pattern. Indexes on \_en columns only                                                 |

---

## 11. Gesture Stack

| Interaction                 | Implementation                                              | Library                        |
| --------------------------- | ----------------------------------------------------------- | ------------------------------ |
| Filter overlay open/dismiss | Bottom sheet with snap points (50%, 92%) + backdrop dismiss | @gorhom/bottom-sheet v5        |
| School list browsing        | Vertical FlashList v2                                       | @shopify/flash-list v2         |
| Filter overlay + bottom nav | Bottom nav slides out when sheet opens                      | react-native-reanimated v4     |
| Back to Top button          | Fixed above bottom nav + safe area + 16pt                   | react-native-safe-area-context |
| Map bottom card             | Low snap point sheet on pin tap                             | @gorhom/bottom-sheet v5        |
| Compare / Shortlist actions | Static Pressable buttons on card                            | React Native core              |
