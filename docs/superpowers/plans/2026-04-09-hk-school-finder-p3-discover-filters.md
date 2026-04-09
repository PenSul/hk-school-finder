# HK School Finder - Plan 3: Discover Tab & Filter System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first user-facing feature: the Discover tab with education level switching, school/institution search, filtered card list (FlashList v2), active filter chips, and a comprehensive bottom-sheet filter overlay with live result counts.

**Architecture:** The Discover screen orchestrates two modes: K-12 (KG/Primary/Secondary) showing SchoolCards from `useSchools`, and University mode showing InstitutionCards from `useInstitutions`. A single `FilterSheet` component (via @gorhom/bottom-sheet v5) conditionally renders filter sections by education level. All filter state flows through Zustand stores, and the screen reactively re-queries the SQLite repositories.

**Tech Stack:** @shopify/flash-list v2, @gorhom/bottom-sheet v5, react-native-gesture-handler v2, react-native-safe-area-context, NativeWind v4, Zustand stores, expo-sqlite via useSQLiteContext

**Spec Reference:** `docs/superpowers/specs/2026-04-08-hk-school-finder-design.md` (Sections 7.1, 7.2, 6.1, 4.3, 11)

**Depends on:** Plan 1 (data layer) + Plan 2 (stores, providers, hooks, navigation)

---

## File Structure (this plan creates)

```
src/
  components/
    shared/
      Badge.tsx                -- finance type colour badge
      FilterChip.tsx           -- toggle chip for filter selection
      SchoolCard.tsx           -- K-12 school list item (React.memo)
      InstitutionCard.tsx      -- HEI list item (React.memo)
      EmptyState.tsx           -- "no results" placeholder
      BackToTopButton.tsx      -- floating scroll-to-top button
    discover/
      EducationLevelTabs.tsx   -- horizontal pill selector
      SearchBar.tsx            -- search input + filter button
      ActiveFilterChips.tsx    -- dismissible active filter row
      FilterSheet.tsx          -- @gorhom/bottom-sheet filter overlay
app/
  _layout.tsx                  -- modify: wrap in GestureHandlerRootView
  (tabs)/
    discover/index.tsx         -- replace: full Discover screen
```

---

### Task 1: Badge and FilterChip Components

**Files:**

- Create: `src/components/shared/Badge.tsx`
- Create: `src/components/shared/FilterChip.tsx`

- [ ] **Step 1: Create src/components/shared/Badge.tsx**

```tsx
import { View, Text } from "react-native";
import { FINANCE_TYPES } from "@/constants/financeTypes";

interface BadgeProps {
  financeType: string;
  locale?: "en" | "tc";
}

export function Badge({ financeType, locale = "en" }: BadgeProps) {
  const config = FINANCE_TYPES[financeType.toUpperCase()];
  if (!config) {
    return (
      <View className="rounded px-2 py-0.5 bg-text-secondary">
        <Text className="text-xs font-medium text-white">{financeType}</Text>
      </View>
    );
  }
  const label = locale === "tc" ? config.labelTc : config.labelEn;
  return (
    <View
      style={{ backgroundColor: config.color }}
      className="rounded px-2 py-0.5"
    >
      <Text className="text-xs font-medium text-white">{label}</Text>
    </View>
  );
}
```

- [ ] **Step 2: Create src/components/shared/FilterChip.tsx**

```tsx
import { Pressable, Text } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function FilterChip({
  label,
  isActive,
  onPress,
  disabled = false,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 mr-2 mb-2 min-h-[36px] items-center justify-center ${
        disabled
          ? "bg-hairline opacity-50"
          : isActive
            ? "bg-primary"
            : "bg-surface-light border border-hairline"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled }}
      accessibilityLabel={`${label} filter${isActive ? ", active" : ""}`}
    >
      <Text
        className={`text-sm ${
          disabled
            ? "text-text-secondary"
            : isActive
              ? "text-white font-medium"
              : "text-text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Badge.tsx src/components/shared/FilterChip.tsx
git commit -m "feat: add Badge and FilterChip shared components"
```

---

### Task 2: SchoolCard Component

**Files:**

- Create: `src/components/shared/SchoolCard.tsx`

- [ ] **Step 1: Create src/components/shared/SchoolCard.tsx**

```tsx
import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { School } from "@/types/school";
import { Badge } from "./Badge";
import { useLanguage } from "@/providers/LanguageProvider";

interface SchoolCardProps {
  school: School;
}

export const SchoolCard = memo(function SchoolCard({
  school,
}: SchoolCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const name =
    locale === "tc" ? school.name_tc || school.name_en : school.name_en;
  const subName = locale === "tc" ? school.name_en : school.name_tc;
  const district = locale === "tc" ? school.district_tc : school.district_en;

  return (
    <Pressable
      onPress={() => router.push(`/school/${school.school_no}`)}
      className="bg-surface-light rounded-xl mx-4 mb-3 p-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${school.name_en}, ${school.district_en}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text
            className="text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            {name}
          </Text>
          {subName ? (
            <Text
              className="text-sm text-text-secondary mt-0.5"
              numberOfLines={1}
            >
              {subName}
            </Text>
          ) : null}
        </View>
        <Badge financeType={school.finance_type_en} locale={locale} />
      </View>
      <View className="flex-row mt-2 gap-3 flex-wrap">
        <Text className="text-xs text-text-secondary">{district}</Text>
        <Text className="text-xs text-text-secondary">
          {locale === "tc" ? school.session_tc : school.session_en}
        </Text>
        <Text className="text-xs text-text-secondary">
          {locale === "tc"
            ? school.students_gender_tc
            : school.students_gender_en}
        </Text>
      </View>
    </Pressable>
  );
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/SchoolCard.tsx
git commit -m "feat: add SchoolCard component with bilingual display and finance badge"
```

---

### Task 3: InstitutionCard Component

**Files:**

- Create: `src/components/shared/InstitutionCard.tsx`

- [ ] **Step 1: Create src/components/shared/InstitutionCard.tsx**

```tsx
import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { HeiInstitution } from "@/types/school";
import { useLanguage } from "@/providers/LanguageProvider";

interface InstitutionCardProps {
  institution: HeiInstitution;
}

export const InstitutionCard = memo(function InstitutionCard({
  institution,
}: InstitutionCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const name =
    locale === "tc"
      ? institution.facility_name_tc || institution.facility_name_en
      : institution.facility_name_en;
  const subName =
    locale === "tc"
      ? institution.facility_name_en
      : institution.facility_name_tc;
  const address =
    locale === "tc"
      ? institution.address_tc || institution.address_en
      : institution.address_en;

  return (
    <Pressable
      onPress={() => router.push(`/institution/${institution.objectid}`)}
      className="bg-surface-light rounded-xl mx-4 mb-3 p-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${institution.facility_name_en}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text
            className="text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            {name}
          </Text>
          {subName ? (
            <Text
              className="text-sm text-text-secondary mt-0.5"
              numberOfLines={1}
            >
              {subName}
            </Text>
          ) : null}
        </View>
        <View className="rounded px-2 py-0.5 bg-text-secondary">
          <Text className="text-xs font-medium text-white">HEI</Text>
        </View>
      </View>
      {address ? (
        <Text className="text-xs text-text-secondary mt-2" numberOfLines={1}>
          {address}
        </Text>
      ) : null}
    </Pressable>
  );
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/InstitutionCard.tsx
git commit -m "feat: add InstitutionCard component with bilingual display"
```

---

### Task 4: EmptyState and BackToTopButton

**Files:**

- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/BackToTopButton.tsx`

- [ ] **Step 1: Create src/components/shared/EmptyState.tsx**

```tsx
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title = "No Results Found",
  message = "Try adjusting your filters or search query",
  icon = "search-outline",
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Ionicons name={icon} size={48} color="#64748B" />
      <Text className="text-lg font-semibold text-text-primary mt-4 text-center">
        {title}
      </Text>
      <Text className="text-sm text-text-secondary mt-2 text-center">
        {message}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Create src/components/shared/BackToTopButton.tsx**

```tsx
import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface BackToTopButtonProps {
  visible: boolean;
  onPress: () => void;
}

export function BackToTopButton({ visible, onPress }: BackToTopButtonProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-24 right-4 bg-primary w-12 h-12 rounded-full items-center justify-center"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
      accessibilityRole="button"
      accessibilityLabel="Scroll to top"
    >
      <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
    </Pressable>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/EmptyState.tsx src/components/shared/BackToTopButton.tsx
git commit -m "feat: add EmptyState and BackToTopButton shared components"
```

---

### Task 5: EducationLevelTabs

**Files:**

- Create: `src/components/discover/EducationLevelTabs.tsx`

- [ ] **Step 1: Create src/components/discover/EducationLevelTabs.tsx**

```tsx
import { ScrollView, Pressable, Text } from "react-native";
import { useFilterStore } from "@/stores/useFilterStore";
import type { EducationLevel } from "@/types/filter";

const LEVELS: { key: EducationLevel; label: string }[] = [
  { key: "KG", label: "KG" },
  { key: "PRIMARY", label: "Primary" },
  { key: "SECONDARY", label: "Secondary" },
  { key: "UNIVERSITY", label: "University" },
];

export function EducationLevelTabs() {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const setEducationLevel = useFilterStore((s) => s.setEducationLevel);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 py-2"
    >
      {LEVELS.map((level) => {
        const isActive = educationLevel === level.key;
        return (
          <Pressable
            key={level.key}
            onPress={() => setEducationLevel(level.key)}
            className={`rounded-full px-4 py-2 mr-2 min-h-[36px] items-center justify-center ${
              isActive
                ? "bg-primary"
                : "bg-surface-light border border-hairline"
            }`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-text-primary"
              }`}
            >
              {level.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discover/EducationLevelTabs.tsx
git commit -m "feat: add EducationLevelTabs component"
```

---

### Task 6: SearchBar

**Files:**

- Create: `src/components/discover/SearchBar.tsx`

- [ ] **Step 1: Create src/components/discover/SearchBar.tsx**

```tsx
import { View, TextInput, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFilterStore } from "@/stores/useFilterStore";

interface SearchBarProps {
  onFilterPress: () => void;
  hasActiveFilters: boolean;
}

export function SearchBar({ onFilterPress, hasActiveFilters }: SearchBarProps) {
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  return (
    <View className="flex-row items-center mx-4 mb-2 gap-2">
      <View className="flex-1 flex-row items-center bg-surface-light rounded-xl px-3 py-2 border border-hairline">
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search schools..."
          placeholderTextColor="#64748B"
          className="flex-1 ml-2 text-base text-text-primary"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search schools"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={8}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={onFilterPress}
        className="relative w-11 h-11 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={`Open filters${hasActiveFilters ? ", filters active" : ""}`}
      >
        <Ionicons name="options-outline" size={24} color="#1E3A5F" />
        {hasActiveFilters && (
          <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent" />
        )}
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discover/SearchBar.tsx
git commit -m "feat: add SearchBar component with filter button and active badge"
```

---

### Task 7: ActiveFilterChips

**Files:**

- Create: `src/components/discover/ActiveFilterChips.tsx`

- [ ] **Step 1: Create src/components/discover/ActiveFilterChips.tsx**

```tsx
import { ScrollView, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFilterStore } from "@/stores/useFilterStore";

interface ChipData {
  label: string;
  onRemove: () => void;
}

export function ActiveFilterChips() {
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);
  const toggleDistrict = useFilterStore((s) => s.toggleDistrict);
  const toggleFinanceType = useFilterStore((s) => s.toggleFinanceType);
  const toggleReligion = useFilterStore((s) => s.toggleReligion);
  const toggleSession = useFilterStore((s) => s.toggleSession);
  const toggleGender = useFilterStore((s) => s.toggleGender);

  const chips: ChipData[] = [
    ...financeTypes.map((f) => ({
      label: f,
      onRemove: () => toggleFinanceType(f),
    })),
    ...sessions.map((s) => ({ label: s, onRemove: () => toggleSession(s) })),
    ...genders.map((g) => ({ label: g, onRemove: () => toggleGender(g) })),
    ...districts.map((d) => ({ label: d, onRemove: () => toggleDistrict(d) })),
    ...religions.map((r) => ({ label: r, onRemove: () => toggleReligion(r) })),
  ];

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 pb-2"
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.label}
          onPress={chip.onRemove}
          className="flex-row items-center bg-primary/10 rounded-full px-3 py-1.5 mr-2"
          accessibilityRole="button"
          accessibilityLabel={`Remove ${chip.label} filter`}
        >
          <Text className="text-xs text-primary mr-1">{chip.label}</Text>
          <Ionicons name="close" size={12} color="#1E3A5F" />
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discover/ActiveFilterChips.tsx
git commit -m "feat: add ActiveFilterChips component with dismissible filter display"
```

---

### Task 8: FilterSheet Component

**Files:**

- Create: `src/components/shared/FilterSheet.tsx`

This is the largest component. It conditionally renders filter sections by education level.

- [ ] **Step 1: Create src/components/shared/FilterSheet.tsx**

```tsx
import { forwardRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { FilterChip } from "./FilterChip";
import { useFilterStore } from "@/stores/useFilterStore";
import { useUniFilterStore } from "@/stores/useUniFilterStore";
import { useSchoolCount } from "@/hooks/useSchoolCount";
import { DISTRICTS } from "@/constants/districts";
import { RELIGIONS } from "@/constants/religions";

// --- K-12 filter options ---

const KG_FINANCE_OPTIONS = ["PRIVATE", "AIDED"];
const PRIMARY_FINANCE_OPTIONS = [
  "GOVERNMENT",
  "AIDED",
  "DSS",
  "ESF",
  "CAPUT",
  "PRIVATE",
];
const SESSION_OPTIONS_BASE = ["AM", "PM", "WHOLE DAY"];
const SESSION_OPTIONS_WITH_EVENING = [...SESSION_OPTIONS_BASE, "EVENING"];
const GENDER_OPTIONS = ["CO-ED", "BOYS", "GIRLS"];

// --- University filter options ---

const STUDY_LEVEL_OPTIONS = [
  "Sub-degree",
  "Undergraduate",
  "Taught Postgraduate",
  "Research Postgraduate",
];
const MODE_OPTIONS = ["Full-time", "Part-time"];

interface FilterSheetProps {
  onClose: () => void;
}

export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  function FilterSheet({ onClose }, ref) {
    const snapPoints = useMemo(() => ["50%", "92%"], []);
    const educationLevel = useFilterStore((s) => s.educationLevel);
    const isUniversity = educationLevel === "UNIVERSITY";

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

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
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <FilterHeader />
          {isUniversity ? <UniversityFilters /> : <K12Filters />}
        </BottomSheetScrollView>
        <FilterFooter onClose={onClose} />
      </BottomSheet>
    );
  },
);

// --- Header ---

function FilterHeader() {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const clearK12 = useFilterStore((s) => s.clearFilters);
  const clearUni = useUniFilterStore((s) => s.clearFilters);
  const isUniversity = educationLevel === "UNIVERSITY";

  return (
    <View className="flex-row justify-between items-center px-4 pb-3 border-b border-hairline">
      <Text className="text-lg font-bold text-text-primary">Filters</Text>
      <Pressable onPress={isUniversity ? clearUni : clearK12}>
        <Text className="text-sm font-medium text-accent">Clear All</Text>
      </Pressable>
    </View>
  );
}

// --- Footer with live count ---

function FilterFooter({ onClose }: { onClose: () => void }) {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const isUniversity = educationLevel === "UNIVERSITY";
  const schoolCount = useSchoolCount();

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface-light border-t border-hairline px-4 py-3">
      <Pressable
        onPress={onClose}
        className="bg-accent rounded-lg py-3 items-center"
        accessibilityRole="button"
      >
        <Text className="text-base font-semibold text-white">
          {isUniversity ? "Apply Filters" : `Show ${schoolCount} Schools`}
        </Text>
      </Pressable>
    </View>
  );
}

// --- K-12 Filters ---

function K12Filters() {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);
  const toggleDistrict = useFilterStore((s) => s.toggleDistrict);
  const toggleFinanceType = useFilterStore((s) => s.toggleFinanceType);
  const toggleReligion = useFilterStore((s) => s.toggleReligion);
  const toggleSession = useFilterStore((s) => s.toggleSession);
  const toggleGender = useFilterStore((s) => s.toggleGender);

  const financeOptions =
    educationLevel === "KG" ? KG_FINANCE_OPTIONS : PRIMARY_FINANCE_OPTIONS;
  const sessionOptions =
    educationLevel === "SECONDARY"
      ? SESSION_OPTIONS_WITH_EVENING
      : SESSION_OPTIONS_BASE;
  const showGender =
    educationLevel === "PRIMARY" || educationLevel === "SECONDARY";

  return (
    <View className="px-4 pt-4">
      <FilterSection title="Finance Type">
        {financeOptions.map((opt) => (
          <FilterChip
            key={opt}
            label={opt}
            isActive={financeTypes.includes(opt)}
            onPress={() => toggleFinanceType(opt)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Session">
        {sessionOptions.map((opt) => (
          <FilterChip
            key={opt}
            label={opt}
            isActive={sessions.includes(opt)}
            onPress={() => toggleSession(opt)}
          />
        ))}
      </FilterSection>

      {showGender && (
        <FilterSection title="Gender">
          {GENDER_OPTIONS.map((opt) => (
            <FilterChip
              key={opt}
              label={opt}
              isActive={genders.includes(opt)}
              onPress={() => toggleGender(opt)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="District">
        {DISTRICTS.map((d) => (
          <FilterChip
            key={d.en}
            label={d.en}
            isActive={districts.includes(d.en)}
            onPress={() => toggleDistrict(d.en)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Religion">
        {RELIGIONS.map((r) => (
          <FilterChip
            key={r.en}
            label={r.en}
            isActive={religions.includes(r.en)}
            onPress={() => toggleReligion(r.en)}
          />
        ))}
      </FilterSection>
    </View>
  );
}

// --- University Filters ---

function UniversityFilters() {
  const scope = useUniFilterStore((s) => s.scope);
  const studyLevels = useUniFilterStore((s) => s.studyLevels);
  const modesOfStudy = useUniFilterStore((s) => s.modesOfStudy);
  const programmeSearch = useUniFilterStore((s) => s.programmeSearch);
  const districts = useUniFilterStore((s) => s.districts);
  const setScope = useUniFilterStore((s) => s.setScope);
  const toggleStudyLevel = useUniFilterStore((s) => s.toggleStudyLevel);
  const toggleModeOfStudy = useUniFilterStore((s) => s.toggleModeOfStudy);
  const setProgrammeSearch = useUniFilterStore((s) => s.setProgrammeSearch);
  const toggleDistrict = useUniFilterStore((s) => s.toggleDistrict);

  const isUgc = scope === "UGC";

  return (
    <View className="px-4 pt-4">
      <FilterSection title="Scope">
        <FilterChip
          label="UGC-funded"
          isActive={isUgc}
          onPress={() => setScope("UGC")}
        />
        <FilterChip
          label="All HEIs"
          isActive={!isUgc}
          onPress={() => setScope("ALL")}
        />
      </FilterSection>

      <FilterSection title="Level of Study">
        {STUDY_LEVEL_OPTIONS.map((opt) => (
          <FilterChip
            key={opt}
            label={opt}
            isActive={studyLevels.includes(opt)}
            onPress={() => toggleStudyLevel(opt)}
            disabled={!isUgc}
          />
        ))}
      </FilterSection>

      <FilterSection title="Mode of Study">
        {MODE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt}
            label={opt}
            isActive={modesOfStudy.includes(opt)}
            onPress={() => toggleModeOfStudy(opt)}
            disabled={!isUgc}
          />
        ))}
      </FilterSection>

      {isUgc && (
        <FilterSection title="Programme Search">
          <View className="w-full flex-row items-center bg-surface-light rounded-xl px-3 py-2 border border-hairline mb-2">
            <TextInput
              value={programmeSearch}
              onChangeText={setProgrammeSearch}
              placeholder="Search programmes..."
              placeholderTextColor="#64748B"
              className="flex-1 text-sm text-text-primary"
              autoCorrect={false}
            />
          </View>
        </FilterSection>
      )}

      <FilterSection title="District">
        {DISTRICTS.map((d) => (
          <FilterChip
            key={d.en}
            label={d.en}
            isActive={districts.includes(d.en)}
            onPress={() => toggleDistrict(d.en)}
          />
        ))}
      </FilterSection>
    </View>
  );
}

// --- Shared section wrapper ---

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-text-primary mb-2">
        {title}
      </Text>
      <View className="flex-row flex-wrap">{children}</View>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/FilterSheet.tsx
git commit -m "feat: add FilterSheet with K-12 and university filter sections, live count, and bottom sheet"
```

---

### Task 9: Update Root Layout for GestureHandler

**Files:**

- Modify: `app/_layout.tsx`

@gorhom/bottom-sheet v5 requires `GestureHandlerRootView` as an ancestor.

- [ ] **Step 1: Modify app/\_layout.tsx**

Add the import and wrap the outermost provider:

At the top of the file, add:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
```

Then wrap the entire return value:

```tsx
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
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
  </GestureHandlerRootView>
);
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: wrap root layout in GestureHandlerRootView for bottom sheet support"
```

---

### Task 10: Discover Screen Assembly

**Files:**

- Modify: `app/(tabs)/discover/index.tsx` (replace placeholder)

- [ ] **Step 1: Replace app/(tabs)/discover/index.tsx**

```tsx
import { useRef, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type BottomSheet from "@gorhom/bottom-sheet";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useFilterStore } from "@/stores/useFilterStore";
import { useSchools } from "@/hooks/useSchools";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useSchoolCount } from "@/hooks/useSchoolCount";
import type { School } from "@/types/school";
import type { HeiInstitution } from "@/types/school";
import { EducationLevelTabs } from "@/components/discover/EducationLevelTabs";
import { SearchBar } from "@/components/discover/SearchBar";
import { ActiveFilterChips } from "@/components/discover/ActiveFilterChips";
import { SchoolCard } from "@/components/shared/SchoolCard";
import { InstitutionCard } from "@/components/shared/InstitutionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { BackToTopButton } from "@/components/shared/BackToTopButton";
import { FilterSheet } from "@/components/shared/FilterSheet";

export default function DiscoverScreen() {
  const educationLevel = useFilterStore((s) => s.educationLevel);
  const hasActiveFilters = useFilterStore(
    (s) =>
      s.searchQuery.trim().length > 0 ||
      s.districts.length > 0 ||
      s.financeTypes.length > 0 ||
      s.religions.length > 0 ||
      s.sessions.length > 0 ||
      s.genders.length > 0,
  );
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const isUniversity = educationLevel === "UNIVERSITY";

  const { schools, loading: schoolsLoading } = useSchools();
  const { institutions, loading: instLoading } = useInstitutions(searchQuery);
  const count = useSchoolCount();

  const flashListRef = useRef<FlashList<School | HeiInstitution>>(null);
  const filterSheetRef = useRef<BottomSheet>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const openFilter = useCallback(() => {
    filterSheetRef.current?.snapToIndex(0);
  }, []);

  const closeFilter = useCallback(() => {
    filterSheetRef.current?.close();
  }, []);

  const scrollToTop = useCallback(() => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowBackToTop(false);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setShowBackToTop(offsetY > 400);
    },
    [],
  );

  const data = isUniversity ? institutions : schools;
  const loading = isUniversity ? instLoading : schoolsLoading;
  const label = isUniversity ? "Institutions" : "Schools";

  const renderItem = useCallback(
    ({ item }: { item: School | HeiInstitution }) => {
      if (isUniversity) {
        return <InstitutionCard institution={item as HeiInstitution} />;
      }
      return <SchoolCard school={item as School} />;
    },
    [isUniversity],
  );

  const keyExtractor = useCallback(
    (item: School | HeiInstitution) => {
      if (isUniversity) {
        return String((item as HeiInstitution).objectid);
      }
      return (item as School).school_no;
    },
    [isUniversity],
  );

  const ListHeader = useCallback(
    () => (
      <Text className="px-4 py-2 text-sm text-text-secondary">
        {count} {label} Found
      </Text>
    ),
    [count, label],
  );

  const ListEmpty = useCallback(
    () => (loading ? null : <EmptyState />),
    [loading],
  );

  return (
    <View className="flex-1 bg-bg-light">
      <EducationLevelTabs />
      <SearchBar
        onFilterPress={openFilter}
        hasActiveFilters={hasActiveFilters}
      />
      <ActiveFilterChips />

      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <BackToTopButton visible={showBackToTop} onPress={scrollToTop} />
      <FilterSheet ref={filterSheetRef} onClose={closeFilter} />
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/discover/index.tsx"
git commit -m "feat: assemble Discover screen with FlashList, filters, search, and education level tabs"
```

---

### Task 11: Verification

- [ ] **Step 1: Run all Jest tests**

```bash
npx jest --verbose
```

Expected: All 13 parser tests still pass.

- [ ] **Step 2: Start Metro and verify no bundler errors**

```bash
npx expo start -c
```

Expected: Metro starts without errors.

- [ ] **Step 3: Verify on Android emulator (if available)**

Expected behavior:

1. App launches with seeding screen, then Discover tab
2. Education level pills at top (KG, Primary, Secondary, University)
3. Search bar with filter button (amber dot when filters active)
4. School cards displayed in a scrollable list with FlashList
5. Tapping filter button opens bottom sheet with filter sections
6. Selecting a filter chip updates the list in real-time
7. Active filters shown as dismissible chips
8. "Show X Schools" button in filter footer shows live count
9. Back to top button appears after scrolling down
10. Switching to "University" shows institution cards
11. University filter sheet shows scope toggle with greyed-out UGC sections when "All HEIs" selected

- [ ] **Step 4: Final commit if adjustments needed**

```bash
git add -A
git commit -m "chore: Plan 3 verification and adjustments"
```
