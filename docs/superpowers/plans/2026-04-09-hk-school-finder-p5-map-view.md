# HK School Finder - Plan 5: Map View

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full-screen Map tab with colour-coded clustered pins, education level filtering, search/filter integration, floating controls (layer switcher, my location), and a MapPreviewSheet bottom sheet for pin tap interactions.

**Architecture:** The map renders schools/institutions as clustered markers via `react-native-map-clustering` (wraps `react-native-maps`). A unified `MapPin` type normalises School and HeiInstitution data. The `useMapPins` hook reads from the shared `useFilterStore` and fetches filtered data from the existing repository layer. Pin taps open a `@gorhom/bottom-sheet` preview with navigation CTAs. Floating controls overlay the map using absolute positioning with safe-area-aware insets.

**Tech Stack:** react-native-maps 1.27.2, react-native-map-clustering, expo-location, @gorhom/bottom-sheet v5, Zustand (shared filter store), expo-sqlite (via existing repositories), NativeWind v4

**Spec Reference:** `docs/superpowers/specs/2026-04-08-hk-school-finder-design.md` (Sections 7.6, 4.2, 4.3)

---

## File Structure (this plan creates/modifies)

```
hk-school-finder/
  src/
    types/
      map.ts                          -- MapPin interface + transform functions
      map.test.ts                     -- Unit tests for transforms
    hooks/
      useMapPins.ts                   -- Filtered map data hook
    components/
      map/
        SchoolPin.tsx                 -- Colour-coded marker view
        MapLevelPills.tsx             -- Education level pills for map overlay
        MapPreviewSheet.tsx           -- Bottom sheet on pin tap
  app/
    (tabs)/
      map/
        index.tsx                     -- Full map screen (replaces placeholder)
  src/
    i18n/
      en.json                         -- Add map translation keys
      tc.json                         -- Add map translation keys
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `hk-school-finder/package.json`

- [ ] **Step 1: Install react-native-map-clustering and expo-location**

```bash
cd hk-school-finder
npm install react-native-map-clustering
npx expo install expo-location
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('react-native-map-clustering'); console.log('map-clustering OK')"
node -e "require('expo-location'); console.log('expo-location OK')"
```

Expected: Both print OK without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-native-map-clustering and expo-location for map view"
```

---

### Task 2: Define MapPin Type and Transform Functions (TDD)

**Files:**
- Create: `hk-school-finder/src/types/map.ts`
- Create: `hk-school-finder/src/types/map.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `hk-school-finder/src/types/map.test.ts`:

```typescript
import { schoolToMapPin, institutionToMapPin } from "./map";
import type { School } from "./school";
import type { HeiInstitution } from "./school";

const MOCK_SCHOOL: School = {
  school_no: "123456",
  name_en: "Test Primary School",
  name_tc: "測試小學",
  category_en: "Primary",
  category_tc: "小學",
  address_en: "1 School Road, Wan Chai",
  address_tc: "灣仔學校道1號",
  school_level_en: "PRIMARY",
  school_level_tc: "小學",
  district_en: "WAN CHAI",
  district_tc: "灣仔",
  finance_type_en: "AIDED",
  finance_type_tc: "資助",
  religion_en: "CATHOLIC",
  religion_tc: "天主教",
  session_en: "WHOLE DAY",
  session_tc: "全日",
  students_gender_en: "CO-ED",
  students_gender_tc: "男女",
  telephone: "21234567",
  fax: "21234568",
  website: "http://test.edu.hk",
  latitude: 22.278,
  longitude: 114.171,
};

const MOCK_INSTITUTION: HeiInstitution = {
  objectid: 42,
  facility_name_en: "Test University",
  facility_name_tc: "測試大學",
  address_en: "10 University Ave, Sha Tin",
  address_tc: "沙田大學道10號",
  telephone: "26001000",
  fax: "26001001",
  email: "info@test.edu.hk",
  website: "http://test.edu.hk",
  latitude: 22.421,
  longitude: 114.210,
};

describe("schoolToMapPin", () => {
  it("maps school_no to id", () => {
    expect(schoolToMapPin(MOCK_SCHOOL).id).toBe("123456");
  });

  it("maps name fields", () => {
    const pin = schoolToMapPin(MOCK_SCHOOL);
    expect(pin.nameEn).toBe("Test Primary School");
    expect(pin.nameTc).toBe("測試小學");
  });

  it("maps address fields", () => {
    const pin = schoolToMapPin(MOCK_SCHOOL);
    expect(pin.addressEn).toBe("1 School Road, Wan Chai");
    expect(pin.addressTc).toBe("灣仔學校道1號");
  });

  it("maps finance_type_en to financeType", () => {
    expect(schoolToMapPin(MOCK_SCHOOL).financeType).toBe("AIDED");
  });

  it("maps coordinates", () => {
    const pin = schoolToMapPin(MOCK_SCHOOL);
    expect(pin.latitude).toBe(22.278);
    expect(pin.longitude).toBe(114.171);
  });

  it("sets type to school", () => {
    expect(schoolToMapPin(MOCK_SCHOOL).type).toBe("school");
  });
});

describe("institutionToMapPin", () => {
  it("maps objectid to string id", () => {
    expect(institutionToMapPin(MOCK_INSTITUTION).id).toBe("42");
  });

  it("maps facility_name to name fields", () => {
    const pin = institutionToMapPin(MOCK_INSTITUTION);
    expect(pin.nameEn).toBe("Test University");
    expect(pin.nameTc).toBe("測試大學");
  });

  it("maps address fields", () => {
    const pin = institutionToMapPin(MOCK_INSTITUTION);
    expect(pin.addressEn).toBe("10 University Ave, Sha Tin");
    expect(pin.addressTc).toBe("沙田大學道10號");
  });

  it("sets financeType to UGC-FUNDED", () => {
    expect(institutionToMapPin(MOCK_INSTITUTION).financeType).toBe("UGC-FUNDED");
  });

  it("maps coordinates", () => {
    const pin = institutionToMapPin(MOCK_INSTITUTION);
    expect(pin.latitude).toBe(22.421);
    expect(pin.longitude).toBe(114.210);
  });

  it("sets type to institution", () => {
    expect(institutionToMapPin(MOCK_INSTITUTION).type).toBe("institution");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd hk-school-finder
npx jest src/types/map.test.ts --no-cache
```

Expected: FAIL -- `Cannot find module './map'`

- [ ] **Step 3: Write the MapPin type and transform functions**

Create `hk-school-finder/src/types/map.ts`:

```typescript
import type { School, HeiInstitution } from "./school";

/** Unified marker data for the map screen */
export interface MapPin {
  id: string;
  nameEn: string;
  nameTc: string;
  addressEn: string;
  addressTc: string;
  financeType: string;
  latitude: number;
  longitude: number;
  type: "school" | "institution";
}

export function schoolToMapPin(school: School): MapPin {
  return {
    id: school.school_no,
    nameEn: school.name_en,
    nameTc: school.name_tc,
    addressEn: school.address_en,
    addressTc: school.address_tc,
    financeType: school.finance_type_en,
    latitude: school.latitude,
    longitude: school.longitude,
    type: "school",
  };
}

export function institutionToMapPin(institution: HeiInstitution): MapPin {
  return {
    id: String(institution.objectid),
    nameEn: institution.facility_name_en,
    nameTc: institution.facility_name_tc,
    addressEn: institution.address_en,
    addressTc: institution.address_tc,
    financeType: "UGC-FUNDED",
    latitude: institution.latitude,
    longitude: institution.longitude,
    type: "institution",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd hk-school-finder
npx jest src/types/map.test.ts --no-cache
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/map.ts src/types/map.test.ts
git commit -m "feat(map): add MapPin type and transform functions with tests"
```

---

### Task 3: Add i18n Translation Keys for Map Screen

**Files:**
- Modify: `hk-school-finder/src/i18n/en.json`
- Modify: `hk-school-finder/src/i18n/tc.json`

- [ ] **Step 1: Add English map keys**

Append the following keys to `hk-school-finder/src/i18n/en.json` (before the closing `}`):

```json
  "map_post_sec": "Post-Sec",
  "map_view_profile": "View Profile",
  "map_directions": "Directions",
  "map_my_location": "My Location",
  "map_location_denied": "Location permission denied",
  "map_layer_standard": "Standard",
  "map_layer_satellite": "Satellite",
  "map_layer_terrain": "Terrain"
```

The full file after edit should end with:

```json
  "compare_programme_count": "Programme Count",
  "map_post_sec": "Post-Sec",
  "map_view_profile": "View Profile",
  "map_directions": "Directions",
  "map_my_location": "My Location",
  "map_location_denied": "Location permission denied",
  "map_layer_standard": "Standard",
  "map_layer_satellite": "Satellite",
  "map_layer_terrain": "Terrain"
}
```

- [ ] **Step 2: Add Traditional Chinese map keys**

Append the following keys to `hk-school-finder/src/i18n/tc.json` (before the closing `}`):

```json
  "map_post_sec": "專上教育",
  "map_view_profile": "查看詳情",
  "map_directions": "導航",
  "map_my_location": "我的位置",
  "map_location_denied": "位置權限被拒絕",
  "map_layer_standard": "標準",
  "map_layer_satellite": "衛星",
  "map_layer_terrain": "地形"
```

The full file after edit should end with:

```json
  "compare_programme_count": "課程數量",
  "map_post_sec": "專上教育",
  "map_view_profile": "查看詳情",
  "map_directions": "導航",
  "map_my_location": "我的位置",
  "map_location_denied": "位置權限被拒絕",
  "map_layer_standard": "標準",
  "map_layer_satellite": "衛星",
  "map_layer_terrain": "地形"
}
```

- [ ] **Step 3: Verify JSON is valid**

```bash
cd hk-school-finder
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8')); console.log('en.json OK')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/tc.json','utf8')); console.log('tc.json OK')"
```

Expected: Both print OK.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.json src/i18n/tc.json
git commit -m "feat(map): add i18n translation keys for map screen"
```

---

### Task 4: Create useMapPins Hook

**Files:**
- Create: `hk-school-finder/src/hooks/useMapPins.ts`

This hook reads the current education level and filter state from `useFilterStore`, queries the appropriate repository, and transforms results into `MapPin[]`.

- [ ] **Step 1: Create the hook**

Create `hk-school-finder/src/hooks/useMapPins.ts`:

```typescript
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFilterStore } from "@/stores/useFilterStore";
import { getSchoolsForMap } from "@/repositories/schoolRepository";
import { getInstitutionsForMap } from "@/repositories/heiRepository";
import { schoolToMapPin, institutionToMapPin } from "@/types/map";
import type { MapPin } from "@/types/map";

export function useMapPins() {
  const db = useSQLiteContext();
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);

  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (educationLevel === "UNIVERSITY") {
      getInstitutionsForMap(db).then((institutions) => {
        if (!cancelled) {
          setPins(institutions.map(institutionToMapPin));
          setLoading(false);
        }
      });
    } else {
      const filters = {
        educationLevel,
        searchQuery,
        districts,
        financeTypes,
        religions,
        sessions,
        genders,
      };
      getSchoolsForMap(db, filters).then((schools) => {
        if (!cancelled) {
          setPins(schools.map(schoolToMapPin));
          setLoading(false);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [
    db,
    educationLevel,
    searchQuery,
    districts,
    financeTypes,
    religions,
    sessions,
    genders,
  ]);

  return { pins, loading };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd hk-school-finder
npx tsc --noEmit src/hooks/useMapPins.ts 2>&1 | head -20
```

Expected: No errors (or only pre-existing unrelated errors).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMapPins.ts
git commit -m "feat(map): add useMapPins hook for filtered map data"
```

---

### Task 5: Create SchoolPin Marker Component

**Files:**
- Create: `hk-school-finder/src/components/map/SchoolPin.tsx`

A simple colour-coded circle marker with a school icon. Uses `memo` for performance. The parent `<Marker>` must set `tracksViewChanges={false}`.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/map/SchoolPin.tsx`:

```typescript
import { memo } from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FINANCE_TYPES } from "@/constants/financeTypes";
import { COLORS } from "@/constants/colors";

interface SchoolPinProps {
  financeType: string;
}

export const SchoolPin = memo(function SchoolPin({ financeType }: SchoolPinProps) {
  const config = FINANCE_TYPES[financeType.toUpperCase()];
  const color = config?.color ?? COLORS.light.textSecondary;

  return (
    <View style={[styles.outer, { borderColor: color }]}>
      <View style={[styles.inner, { backgroundColor: color }]}>
        <Ionicons name="school-outline" size={12} color="#FFFFFF" />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  inner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/map/SchoolPin.tsx
git commit -m "feat(map): add SchoolPin colour-coded marker component"
```

---

### Task 6: Create MapLevelPills Component

**Files:**
- Create: `hk-school-finder/src/components/map/MapLevelPills.tsx`

Education level pills that float on the map. Uses the shared `useFilterStore` but displays "Post-Sec" instead of "University" for the `UNIVERSITY` level.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/map/MapLevelPills.tsx`:

```typescript
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useFilterStore } from "@/stores/useFilterStore";
import { useLanguage } from "@/providers/LanguageProvider";
import type { EducationLevel } from "@/types/filter";

const LEVELS: { key: EducationLevel; enLabel: string; i18nKey: string }[] = [
  { key: "KG", enLabel: "KG", i18nKey: "education_kg" },
  { key: "PRIMARY", enLabel: "Primary", i18nKey: "education_primary" },
  { key: "SECONDARY", enLabel: "Secondary", i18nKey: "education_secondary" },
  { key: "UNIVERSITY", enLabel: "Post-Sec", i18nKey: "map_post_sec" },
];

export function MapLevelPills() {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const setEducationLevel = useFilterStore((s) => s.setEducationLevel);
  const { t } = useLanguage();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {LEVELS.map((level) => {
        const isActive = educationLevel === level.key;
        return (
          <Pressable
            key={level.key}
            onPress={() => setEducationLevel(level.key)}
            style={[
              styles.pill,
              isActive ? styles.pillActive : styles.pillInactive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.pillText,
                isActive ? styles.pillTextActive : styles.pillTextInactive,
              ]}
            >
              {t(level.i18nKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pillActive: {
    backgroundColor: "#1E3A5F",
  },
  pillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextInactive: {
    color: "#1E293B",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/map/MapLevelPills.tsx
git commit -m "feat(map): add MapLevelPills education level overlay component"
```

---

### Task 7: Create MapPreviewSheet Component

**Files:**
- Create: `hk-school-finder/src/components/map/MapPreviewSheet.tsx`

A `@gorhom/bottom-sheet` that appears when a pin is tapped. Shows school/institution name (EN + TC), heart/shortlist icon, finance badge, address, and two CTA buttons: "View Profile" and "Directions".

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/map/MapPreviewSheet.tsx`:

```typescript
import { forwardRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, Linking, Platform, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Badge } from "@/components/shared/Badge";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { useLanguage } from "@/providers/LanguageProvider";
import type { MapPin } from "@/types/map";

interface MapPreviewSheetProps {
  pin: MapPin | null;
  onClose: () => void;
}

export const MapPreviewSheet = forwardRef<BottomSheet, MapPreviewSheetProps>(
  function MapPreviewSheet({ pin, onClose }, ref) {
    const snapPoints = useMemo(() => [220], []);
    const router = useRouter();
    const { locale, t } = useLanguage();

    const isShortlisted = useShortlistStore((s) =>
      pin ? s.isShortlisted(pin.id) : false
    );
    const addToShortlist = useShortlistStore((s) => s.addToShortlist);
    const removeFromShortlist = useShortlistStore((s) => s.removeFromShortlist);

    const toggleShortlist = useCallback(() => {
      if (!pin) return;
      if (isShortlisted) {
        removeFromShortlist(pin.id);
      } else {
        addToShortlist(pin.id);
      }
    }, [pin, isShortlisted, addToShortlist, removeFromShortlist]);

    const navigateToDetail = useCallback(() => {
      if (!pin) return;
      onClose();
      if (pin.type === "school") {
        router.push(`/school/${pin.id}`);
      } else {
        router.push(`/institution/${pin.id}`);
      }
    }, [pin, router, onClose]);

    const openDirections = useCallback(() => {
      if (!pin) return;
      const label = encodeURIComponent(pin.nameEn);
      const url = Platform.select({
        ios: `maps:0,0?q=${pin.latitude},${pin.longitude}(${label})`,
        android: `geo:0,0?q=${pin.latitude},${pin.longitude}(${label})`,
      });
      if (url) Linking.openURL(url);
    }, [pin]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.2}
          pressBehavior="close"
        />
      ),
      []
    );

    const name = pin
      ? locale === "tc"
        ? pin.nameTc || pin.nameEn
        : pin.nameEn
      : "";
    const subName = pin
      ? locale === "tc"
        ? pin.nameEn
        : pin.nameTc
      : "";
    const address = pin
      ? locale === "tc"
        ? pin.addressTc || pin.addressEn
        : pin.addressEn
      : "";

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#64748B" }}
      >
        <View style={styles.content}>
          {/* Header: name + shortlist heart */}
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {subName ? (
                <Text style={styles.subName} numberOfLines={1}>
                  {subName}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={toggleShortlist}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                isShortlisted
                  ? t("detail_remove_shortlist")
                  : t("detail_add_shortlist")
              }
            >
              <Ionicons
                name={isShortlisted ? "heart" : "heart-outline"}
                size={24}
                color={isShortlisted ? "#F59E0B" : "#64748B"}
              />
            </Pressable>
          </View>

          {/* Finance badge */}
          {pin ? (
            <View style={styles.badgeRow}>
              <Badge financeType={pin.financeType} locale={locale} />
            </View>
          ) : null}

          {/* Address */}
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>

          {/* CTA buttons */}
          <View style={styles.ctaRow}>
            <Pressable
              onPress={navigateToDetail}
              style={styles.viewProfileBtn}
              accessibilityRole="button"
              accessibilityLabel={t("map_view_profile")}
            >
              <Text style={styles.viewProfileText}>
                {t("map_view_profile")}
              </Text>
            </Pressable>
            <Pressable
              onPress={openDirections}
              style={styles.directionsBtn}
              accessibilityRole="button"
              accessibilityLabel={t("map_directions")}
            >
              <Ionicons name="navigate-outline" size={16} color="#1E3A5F" />
              <Text style={styles.directionsText}>
                {t("map_directions")}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  subName: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  address: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
  },
  ctaRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  viewProfileBtn: {
    flex: 1,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  directionsBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#1E3A5F",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A5F",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/map/MapPreviewSheet.tsx
git commit -m "feat(map): add MapPreviewSheet bottom sheet component"
```

---

### Task 8: Implement MapScreen

**Files:**
- Modify: `hk-school-finder/app/(tabs)/map/index.tsx` (replace placeholder)

This is the main map screen. It renders:
1. A clustered `MapView` from `react-native-map-clustering`
2. Floating overlay: education level pills + search bar + filter button
3. Floating controls: layer switcher (top-right) + my location (bottom-right)
4. `SchoolPin` markers for each map pin
5. `MapPreviewSheet` on pin tap
6. Reused `FilterSheet` for filter overlay

- [ ] **Step 1: Replace the map screen placeholder**

Replace the entire contents of `hk-school-finder/app/(tabs)/map/index.tsx` with:

```typescript
import { useState, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import type { MapPressEvent, Region } from "react-native-maps";
import type BottomSheet from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMapPins } from "@/hooks/useMapPins";
import { useFilterStore } from "@/stores/useFilterStore";
import { SchoolPin } from "@/components/map/SchoolPin";
import { MapLevelPills } from "@/components/map/MapLevelPills";
import { MapPreviewSheet } from "@/components/map/MapPreviewSheet";
import { SearchBar } from "@/components/discover/SearchBar";
import { FilterSheet } from "@/components/shared/FilterSheet";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { MapPin } from "@/types/map";

const HK_REGION: Region = {
  latitude: 22.35,
  longitude: 114.15,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

type MapType = "standard" | "satellite" | "terrain";
const MAP_TYPES: MapType[] = ["standard", "satellite", "terrain"];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { pins, loading } = useMapPins();
  const hasActiveFilters = useFilterStore(
    (s) =>
      s.searchQuery.trim().length > 0 ||
      s.districts.length > 0 ||
      s.financeTypes.length > 0 ||
      s.religions.length > 0 ||
      s.sessions.length > 0 ||
      s.genders.length > 0
  );

  const mapRef = useRef<any>(null);
  const filterSheetRef = useRef<BottomSheet>(null);
  const previewSheetRef = useRef<BottomSheet>(null);

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [mapType, setMapType] = useState<MapType>("standard");

  const openFilter = useCallback(() => {
    filterSheetRef.current?.snapToIndex(0);
  }, []);

  const closeFilter = useCallback(() => {
    filterSheetRef.current?.close();
  }, []);

  const onMarkerPress = useCallback((pin: MapPin) => {
    setSelectedPin(pin);
    previewSheetRef.current?.snapToIndex(0);
  }, []);

  const onPreviewClose = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const cycleMapType = useCallback(() => {
    setMapType((prev) => {
      const idx = MAP_TYPES.indexOf(prev);
      return MAP_TYPES[(idx + 1) % MAP_TYPES.length];
    });
  }, []);

  const goToMyLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("map_location_denied"));
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [t]);

  const onMapPress = useCallback((_e: MapPressEvent) => {
    previewSheetRef.current?.close();
  }, []);

  const mapTypeIcon =
    mapType === "standard"
      ? "layers-outline"
      : mapType === "satellite"
        ? "globe-outline"
        : "trail-sign-outline";

  return (
    <View style={styles.container}>
      {/* Map */}
      <ClusteredMapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={HK_REGION}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={onMapPress}
        clusterColor={COLORS.primary}
        clusterTextColor="#FFFFFF"
        radius={50}
        minZoomLevel={8}
        maxZoomLevel={18}
        animationEnabled={false}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            identifier={pin.id}
            coordinate={{
              latitude: pin.latitude,
              longitude: pin.longitude,
            }}
            tracksViewChanges={false}
            onPress={() => onMarkerPress(pin)}
          >
            <SchoolPin financeType={pin.financeType} />
          </Marker>
        ))}
      </ClusteredMapView>

      {/* Loading indicator */}
      {loading && (
        <View style={[styles.loadingOverlay, { top: insets.top + 110 }]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      {/* Floating overlay: pills + search */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 4 }]}>
        <MapLevelPills />
        <View style={styles.searchRow}>
          <SearchBar onFilterPress={openFilter} hasActiveFilters={hasActiveFilters} />
        </View>
      </View>

      {/* Layer switcher (right side, below search) */}
      <Pressable
        onPress={cycleMapType}
        style={[styles.floatingBtn, { top: insets.top + 120, right: 16 }]}
        accessibilityRole="button"
        accessibilityLabel={t("map_layer_standard")}
      >
        <Ionicons name={mapTypeIcon} size={22} color={COLORS.primary} />
      </Pressable>

      {/* My Location button (bottom-right) */}
      <Pressable
        onPress={goToMyLocation}
        style={[styles.floatingBtn, { bottom: 100, right: 16 }]}
        accessibilityRole="button"
        accessibilityLabel={t("map_my_location")}
      >
        <Ionicons name="locate-outline" size={22} color={COLORS.primary} />
      </Pressable>

      {/* Sheets */}
      <MapPreviewSheet
        ref={previewSheetRef}
        pin={selectedPin}
        onClose={onPreviewClose}
      />
      <FilterSheet ref={filterSheetRef} onClose={closeFilter} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchRow: {
    marginTop: 4,
  },
  floatingBtn: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 10,
  },
  loadingOverlay: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 5,
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd hk-school-finder
npx tsc --noEmit 2>&1 | grep "map/index" | head -10
```

Expected: No errors referencing the map screen.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/map/index.tsx
git commit -m "feat(map): implement full map screen with clustering, pins, and preview sheet"
```

---

### Task 9: End-to-End Verification

- [ ] **Step 1: Run all unit tests**

```bash
cd hk-school-finder
npx jest --no-cache
```

Expected: All tests pass including the new `map.test.ts` tests.

- [ ] **Step 2: Run full TypeScript check**

```bash
cd hk-school-finder
npx tsc --noEmit
```

Expected: No new type errors.

- [ ] **Step 3: Start the development build and verify map**

```bash
cd hk-school-finder
npx expo start
```

On the Android emulator:
1. Tap the **Map** tab -- verify the full-screen map loads centred on Hong Kong
2. Verify **coloured pins** appear for schools (matching finance type colours)
3. Verify **clustering** -- zoom out to see cluster bubbles with counts
4. Verify **education level pills** at top -- tap each (KG, Primary, Secondary, Post-Sec) and see pins update
5. Verify **search bar** -- type a school name and see pins filter
6. Verify **filter button** -- opens the FilterSheet overlay
7. **Tap a pin** -- verify MapPreviewSheet slides up with:
   - School name (EN + TC)
   - Heart/shortlist icon (tap to toggle)
   - Finance type badge
   - Address (single line)
   - "View Profile" button (navigates to detail screen)
   - "Directions" button (opens native maps app)
8. **Layer button** (top-right) -- tap to cycle Standard -> Satellite -> Terrain -> Standard
9. **My Location button** (bottom-right) -- tap, grant permission, map centres on emulator location
10. **Dismiss preview** -- swipe down or tap map background to close the bottom sheet

- [ ] **Step 4: Verify accessibility**

- All floating buttons have `accessibilityRole="button"` and `accessibilityLabel`
- Education level pills have `accessibilityRole="tab"` and `accessibilityState`
- Heart icon has descriptive `accessibilityLabel`
- Touch targets are >= 44x44pt

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
cd hk-school-finder
git add -A
git commit -m "fix(map): address issues found during e2e verification"
```

**Note:** If the Google Maps API key is not yet configured for the Android development build, you will see a blank map with a "Google" watermark. Configure the key in `app.json` at `expo.android.config.googleMaps.apiKey` with a valid Maps SDK key. This is an infrastructure concern, not a code issue.
