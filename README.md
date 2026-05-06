# HK School Finder

A comprehensive mobile application for discovering, comparing, and tracking Hong Kong schools -- from kindergarten to university. Built with React Native and Expo SDK 55.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-55-000020.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org)

---

## Background

Choosing the right school is one of the most important decisions Hong Kong families face. The Education Bureau (EDB) publishes open data on over 2,500 schools, 122 higher education institutions, and 1,000+ UGC-funded university programmes -- but this data is scattered across multiple government portals in raw JSON/GeoJSON formats that are not user-friendly for parents and students.

**HK School Finder** bridges this gap by aggregating all three official datasets into a single, offline-capable mobile app with intuitive search, map-based exploration, side-by-side comparison, and admission event tracking -- all in both English and Traditional Chinese.

## Problem Statement

Parents and students in Hong Kong face several challenges when researching schools:

- **Fragmented data sources** -- School information is spread across the EDB website, CSDI portal, and UGC portal with no unified interface
- **No mobile-first experience** -- Government portals are desktop-oriented and difficult to navigate on phones
- **No comparison tools** -- Comparing schools requires manually opening multiple browser tabs and noting differences
- **No admission timeline tracking** -- Key dates for POA (Primary One Admission), SSPA (Secondary School Places Allocation), and KG admission are scattered across circulars and school websites
- **Language barriers** -- Some portals only display data in one language, making it harder for bilingual families

HK School Finder solves all of these problems in a single, local-first mobile application.

---

## Features

### Discover Schools

Search and filter across all education levels with powerful multi-criteria filtering:

- **Education Level Tabs** -- Switch between Kindergarten, Primary, Secondary, and University
- **Full-Text Search** -- Search by school name (English/Chinese) or address
- **Advanced Filters** -- Filter by district (18 HK districts), finance type (Government, Aided, DSS, ESF, Private, Caput), religion, session (AM/PM/Whole Day), and gender (Co-ed/Boys/Girls)
- **University Filters** -- Filter UGC programmes by study level, mode of study, and scope
- **Active Filter Chips** -- Visual display of applied filters with one-tap removal
- **High-Performance Lists** -- FlashList-powered infinite scrolling with 50-item pagination

### Interactive Map

Visualize every school and institution on an interactive Google Maps view:

- **Custom Map Pins** -- Color-coded by finance type for quick identification
- **Map Layer Switching** -- Toggle between standard, satellite, and terrain views
- **GPS Location** -- Jump to your current location to find nearby schools
- **Tap-to-Preview** -- Tap any pin to see a bottom sheet with school details and quick actions
- **Synced Filters** -- Map pins respond to the same filters as the Discover tab

### Shortlist & Application Tracker

Save schools of interest and track your application journey:

- **One-Tap Shortlisting** -- Save any school or institution from any screen
- **Application Status Stepper** -- Track progress through 4 stages: Interested, Visited, Applied, Result
- **Persistent Storage** -- Shortlist and status survive app restarts
- **Quick Navigation** -- Tap any shortlisted item to view full details

### Calendar & Events

Stay on top of admission deadlines and school events:

- **Monthly Calendar Grid** -- Visual calendar with event indicator dots
- **Pre-Seeded Events** -- 15 demo events covering POA, KG, SSPA, and open day timelines
- **Custom Events** -- Create your own reminders with title, date, time, and category
- **Push Notifications** -- Set reminders that alert you one day before each event
- **Calendar Export** -- Export events directly to your device's system calendar

### School Comparison

Compare up to 3 schools side-by-side:

- **Comparison Table** -- View category, finance type, gender, session, district, and religion in a scrollable table
- **Difference Highlighting** -- Fields that differ between schools are highlighted in yellow
- **Quick Add/Remove** -- Manage comparison selections from any school card or detail page

### Bilingual Support

Full English and Traditional Chinese interface:

- **Dynamic Language Switching** -- Change language instantly from Settings
- **Bilingual Data Display** -- Primary language shown as title, alternate language as subtitle
- **Localized Filters** -- All filter options (districts, religions, etc.) display in the selected language

### Dark Mode

Complete light and dark theme support:

- **Three Modes** -- Light, Dark, or System (follows device setting)
- **NativeWind Integration** -- Tailwind CSS dark mode classes applied throughout the UI
- **Persistent Preference** -- Theme choice saved across app restarts

---

## Tech Stack

| Layer         | Technology                                                                            | Version                   |
| ------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| Framework     | [Expo](https://expo.dev)                                                              | SDK 55                    |
| Runtime       | [React Native](https://reactnative.dev)                                               | 0.83                      |
| Language      | [TypeScript](https://www.typescriptlang.org)                                          | 5.9 (strict)              |
| UI            | React                                                                                 | 19.2                      |
| Navigation    | [Expo Router](https://docs.expo.dev/router/introduction/)                             | File-based routing        |
| Styling       | [NativeWind](https://www.nativewind.dev) v4 + [Tailwind CSS](https://tailwindcss.com) | 3.4                       |
| State         | [Zustand](https://zustand-demo.pmnd.rs)                                               | 5.0                       |
| Database      | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)                      | SQLite (WAL mode)         |
| Preferences   | react-native-mmkv                                                                     | Encrypted key-value store |
| Lists         | [@shopify/flash-list](https://shopify.github.io/flash-list/)                          | 2.0                       |
| Maps          | [react-native-maps](https://github.com/react-native-maps/react-native-maps)           | 1.27 (Google Maps)        |
| Bottom Sheets | [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/)                 | 5.x                       |
| Animations    | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)        | 4.2                       |
| Notifications | expo-notifications                                                                    | Push reminders            |
| Calendar      | expo-calendar                                                                         | System calendar export    |
| i18n          | expo-localization + custom JSON maps                                                  | EN / TC                   |
| Networking    | @react-native-community/netinfo                                                       | Offline detection         |

---

## Architecture

```
External APIs (EDB, CSDI, UGC)
  |  fetch once on first launch
  v
Seed Layer (TanStack Query orchestrates)
  |  parse JSON/GeoJSON, batch INSERT
  v
expo-sqlite (local-first data store)
  |  schools, hei_institutions, ugc_programmes, calendar_events
  v
Repository Layer (encapsulates all SQL)
  |  schoolRepository, heiRepository, programmeRepository, calendarRepository
  v
Custom Hooks (bridge repositories to components)
  |  useSchools, useMapPins, useCalendarEvents, useShortlistedItems, ...
  v
UI Components (NativeWind + Zustand)
```

### State Management

| Store                   | Persisted  | Purpose                                                                    |
| ----------------------- | ---------- | -------------------------------------------------------------------------- |
| `useFilterStore`        | No         | School filter criteria (district, finance type, religion, session, gender) |
| `useUniFilterStore`     | No         | University filter criteria (study level, mode, scope)                      |
| `useCompareStore`       | No         | Comparison selections (max 3 schools)                                      |
| `useShortlistStore`     | Yes (MMKV) | Saved school/institution IDs                                               |
| `useStatusTrackerStore` | Yes (MMKV) | Per-school application stage tracking                                      |
| `ThemeProvider`         | Yes (MMKV) | Light/dark/system theme preference                                         |
| `LanguageProvider`      | Yes (MMKV) | English/Traditional Chinese selection                                      |

---

## Project Structure

```
hksf/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (providers, DB init)
│   ├── index.tsx                 # Redirect to /(tabs)/discover
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator (5 tabs)
│   │   ├── discover/index.tsx    # School search & filters
│   │   ├── map/index.tsx         # Interactive map
│   │   ├── shortlist/index.tsx   # Saved schools & status tracker
│   │   ├── calendar/index.tsx    # Calendar & event management
│   │   └── settings/index.tsx    # Preferences & data management
│   ├── school/[id].tsx           # School detail page
│   ├── institution/[id].tsx      # HEI detail page
│   ├── compare/index.tsx         # Side-by-side comparison
│   └── event/                    # Event create/edit screens
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── discover/             # SearchBar, EducationLevelTabs, ActiveFilterChips
│   │   ├── map/                  # MapLevelPills, MapPreviewSheet, SchoolPin
│   │   ├── calendar/             # CalendarGrid, EventCard, EventForm
│   │   ├── shortlist/            # StatusStepper
│   │   ├── detail/               # AccordionSection, ContactRow, InfoTile
│   │   └── shared/               # SchoolCard, FilterSheet, Badge, EmptyState
│   ├── stores/                   # Zustand state stores (5)
│   ├── hooks/                    # Custom React hooks (11)
│   ├── repositories/             # Data access layer (SQL queries)
│   ├── db/                       # SQLite schema, migrations, seeding
│   ├── providers/                # Theme, Language, Database providers
│   ├── types/                    # TypeScript type definitions
│   ├── constants/                # Colors, districts, religions, finance types
│   └── i18n/                     # en.json, tc.json translation files
│
├── assets/
│   └── data/                     # JSON data fixtures (dev + HEI/UGC cache)
│
├── docs/                         # Design specs & implementation plans
├── app.json                      # Expo configuration
├── tailwind.config.js            # NativeWind/Tailwind configuration
└── package.json
```

---

## Data Sources

All data comes from Hong Kong government open data portals:

| Dataset                       | Source                                                                                                                                          | Records | Format  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| Schools                       | [EDB School Location & Information](http://www.edb.gov.hk/attachment/en/student-parents/sch-info/sch-search/sch-location-info/SCH_LOC_EDB.json) | ~2,500+ | JSON    |
| Higher Education Institutions | [CSDI ASFPS Portal](https://portal.csdi.gov.hk)                                                                                                 | 122     | GeoJSON |
| UGC-Funded Programmes         | [CSDI UGC Portal](https://portal.csdi.gov.hk)                                                                                                   | ~1,031  | GeoJSON |

Data is fetched once on first launch and stored locally in SQLite. The app works fully offline after the initial data sync.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- [Android Studio](https://developer.android.com/studio) with Android SDK (API 35 recommended)
- [Microsoft-openjdk17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17) Please check [Expo Docs](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=simulated&buildEnv=local)
- A Google Maps API key with Maps SDK for Android enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/PenSul/hk-school-finder.git
cd hk-school-finder

# Install dependencies
npm install
```

### Configuration

Add your Google Maps API key in `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### Running the App

```bash
# Generate native project files
npx expo prebuild --clean

# Run on Android emulator or device
npx expo run:android

# Or run on iOS simulator (macOS only)
npx expo run:ios
```

> **Note:** This app requires a development build (not Expo Go) due to native dependencies including `react-native-maps`, `react-native-mmkv`, and `react-native-reanimated` v4.

### Running Tests

```bash
npm test
```

---

## Acknowledgments

- **Education Bureau (EDB), HKSAR Government** -- School location and information dataset
- **Common Spatial Data Infrastructure (CSDI) Portal** -- Higher education institution and UGC programme geospatial data
- **University Grants Committee (UGC)** -- UGC-funded programme data
- **Expo** -- Cross-platform development framework
- **React Native Community** -- Open-source libraries powering the app

### Open Data Attribution

This application uses data from the Hong Kong SAR Government's open data portals. The data is provided under the [terms of use](https://data.gov.hk/en/terms-and-conditions) of DATA.GOV.HK.

---

## License

This project is licensed under the MIT License -- see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jacky Chiang
