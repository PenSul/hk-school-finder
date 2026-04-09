# Detail Screens & Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement school detail, institution detail, and side-by-side comparison screens with full bilingual support, accordion sections, contact rows, and compare/shortlist integration.

**Architecture:** Detail screens fetch data by ID via existing repository functions, render via composable detail components (HeroBanner, QuickInfoStrip, AccordionSection, ContactRow). Comparison screen reads from useCompareStore, fetches all selected items, and renders a horizontally scrollable diff table. All components use useLanguage() for EN/TC switching.

**Tech Stack:** Expo Router (navigation params), expo-sqlite (via existing repos), Zustand (compare/shortlist stores), NativeWind v4 (styling), react-native-reanimated v4 (accordion animation), Ionicons (icons), Linking (tel/mailto/url actions).

---

### Task 1: i18n Keys for Detail & Comparison Screens

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/tc.json`

- [ ] **Step 1: Add EN translation keys**

Open `src/i18n/en.json` and add these keys (merge into existing object):

```json
{
  "detail_overview": "Overview",
  "detail_contact": "Contact",
  "detail_school_info": "School Information",
  "detail_religion": "Religion",
  "detail_address": "Address",
  "detail_category": "Category",
  "detail_finance_type": "Finance Type",
  "detail_school_level": "School Level",
  "detail_gender": "Gender",
  "detail_session": "Session",
  "detail_district": "District",
  "detail_telephone": "Telephone",
  "detail_fax": "Fax",
  "detail_email": "Email",
  "detail_website": "Website",
  "detail_not_available": "Not available",
  "detail_view_on_map": "View on Map",
  "detail_add_shortlist": "Add to Shortlist",
  "detail_remove_shortlist": "Remove from Shortlist",
  "detail_compare": "Compare",
  "detail_programmes": "Programmes",
  "detail_programme_count": "{count} Programmes",
  "detail_search_programmes": "Search programmes...",
  "detail_no_programmes": "No programmes available",
  "detail_level_of_study": "Level of Study",
  "detail_mode_of_study": "Mode of Study",
  "detail_school_not_found": "School not found",
  "detail_institution_not_found": "Institution not found",
  "detail_go_back": "Go Back",
  "compare_title": "Compare",
  "compare_empty": "No Schools Selected",
  "compare_empty_message": "Select 2-3 schools from the Discover tab to compare",
  "compare_clear": "Clear All",
  "compare_back_discover": "Back to Discover",
  "compare_programme_count": "Programme Count"
}
```

- [ ] **Step 2: Add TC translation keys**

Open `src/i18n/tc.json` and add these keys (merge into existing object):

```json
{
  "detail_overview": "概覽",
  "detail_contact": "聯絡",
  "detail_school_info": "學校資料",
  "detail_religion": "宗教",
  "detail_address": "地址",
  "detail_category": "類別",
  "detail_finance_type": "資助種類",
  "detail_school_level": "學校類型",
  "detail_gender": "就讀學生性別",
  "detail_session": "授課時間",
  "detail_district": "分區",
  "detail_telephone": "電話",
  "detail_fax": "傳真",
  "detail_email": "電郵",
  "detail_website": "網頁",
  "detail_not_available": "未有提供",
  "detail_view_on_map": "在地圖查看",
  "detail_add_shortlist": "加入收藏",
  "detail_remove_shortlist": "取消收藏",
  "detail_compare": "比較",
  "detail_programmes": "課程",
  "detail_programme_count": "{count} 個課程",
  "detail_search_programmes": "搜尋課程...",
  "detail_no_programmes": "沒有可用課程",
  "detail_level_of_study": "修讀程度",
  "detail_mode_of_study": "修讀模式",
  "detail_school_not_found": "找不到學校",
  "detail_institution_not_found": "找不到院校",
  "detail_go_back": "返回",
  "compare_title": "比較",
  "compare_empty": "未選擇學校",
  "compare_empty_message": "從探索頁面選擇2至3間學校進行比較",
  "compare_clear": "清除全部",
  "compare_back_discover": "返回探索",
  "compare_programme_count": "課程數量"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.json src/i18n/tc.json
git commit -m "feat(i18n): add translation keys for detail and comparison screens"
```

---

### Task 2: Data Hooks for Detail Screens

**Files:**
- Create: `src/hooks/useSchoolById.ts`
- Create: `src/hooks/useInstitutionById.ts`
- Create: `src/hooks/useProgrammesByInstitution.ts`

- [ ] **Step 1: Create useSchoolById hook**

Create `src/hooks/useSchoolById.ts`:

```typescript
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { School } from "@/types/school";
import { getSchoolById } from "@/repositories/schoolRepository";

export function useSchoolById(schoolNo: string) {
  const db = useSQLiteContext();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSchoolById(db, schoolNo).then((result) => {
      if (!cancelled) {
        setSchool(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, schoolNo]);

  return { school, loading };
}
```

- [ ] **Step 2: Create useInstitutionById hook**

Create `src/hooks/useInstitutionById.ts`:

```typescript
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { HeiInstitution } from "@/types/school";
import { getInstitutionById } from "@/repositories/heiRepository";

export function useInstitutionById(objectid: number) {
  const db = useSQLiteContext();
  const [institution, setInstitution] = useState<HeiInstitution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInstitutionById(db, objectid).then((result) => {
      if (!cancelled) {
        setInstitution(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, objectid]);

  return { institution, loading };
}
```

- [ ] **Step 3: Create useProgrammesByInstitution hook**

Create `src/hooks/useProgrammesByInstitution.ts`:

```typescript
import { useEffect, useState, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { UgcProgramme } from "@/types/school";
import { getProgrammesByUniversity } from "@/repositories/programmeRepository";

const DEBOUNCE_MS = 300;

export function useProgrammesByInstitution(
  universityEn: string,
  searchQuery = ""
) {
  const db = useSQLiteContext();
  const [programmes, setProgrammes] = useState<UgcProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!universityEn) {
      setProgrammes([]);
      setLoading(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setLoading(true);
    timerRef.current = setTimeout(() => {
      getProgrammesByUniversity(db, universityEn, searchQuery).then(
        (result) => {
          setProgrammes(result);
          setLoading(false);
        }
      );
    }, searchQuery ? DEBOUNCE_MS : 0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [db, universityEn, searchQuery]);

  return { programmes, loading };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSchoolById.ts src/hooks/useInstitutionById.ts src/hooks/useProgrammesByInstitution.ts
git commit -m "feat(hooks): add useSchoolById, useInstitutionById, useProgrammesByInstitution"
```

---

### Task 3: Shared Detail Components

**Files:**
- Create: `src/components/detail/AccordionSection.tsx`
- Create: `src/components/detail/ContactRow.tsx`
- Create: `src/components/detail/InfoTile.tsx`

- [ ] **Step 1: Create AccordionSection component**

Create `src/components/detail/AccordionSection.tsx`:

```typescript
import { memo, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
  useReducedMotion,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AccordionSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionSection = memo(function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
}: AccordionSectionProps) {
  const reduceMotion = useReducedMotion();
  const progress = useDerivedValue(() => {
    const target = expanded ? 1 : 0;
    return reduceMotion ? target : withTiming(target, { duration: 250 });
  }, [expanded, reduceMotion]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 500,
    overflow: "hidden" as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <View className="bg-surface-light rounded-xl mx-4 mb-3 overflow-hidden">
      <Pressable
        onPress={onToggle}
        className="flex-row justify-between items-center px-4 py-3"
        style={{ minHeight: 48 }}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${expanded ? "collapse" : "expand"}`}
        accessibilityState={{ expanded }}
      >
        <Text className="text-base font-semibold text-text-primary flex-1">
          {title}
        </Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </Animated.View>
      </Pressable>
      <Animated.View style={bodyStyle}>
        <View className="px-4 pb-4">{children}</View>
      </Animated.View>
    </View>
  );
});
```

- [ ] **Step 2: Create ContactRow component**

Create `src/components/detail/ContactRow.tsx`:

```typescript
import { memo } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLanguage } from "@/providers/LanguageProvider";

interface ContactRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
  type?: "tel" | "fax" | "email" | "url";
}

function handlePress(value: string, type: string) {
  switch (type) {
    case "tel":
      Linking.openURL(`tel:${value}`);
      break;
    case "email":
      Linking.openURL(`mailto:${value}`);
      break;
    case "url": {
      const url = value.startsWith("http") ? value : `https://${value}`;
      Linking.openURL(url);
      break;
    }
  }
}

export const ContactRow = memo(function ContactRow({
  icon,
  label,
  value,
  type,
}: ContactRowProps) {
  const { t } = useLanguage();
  const hasValue = value !== null && value.trim() !== "";
  const isActionable = hasValue && type && type !== "fax";

  const content = (
    <View
      className="flex-row items-center py-3 border-b border-hairline-light"
      style={{ minHeight: 48 }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={hasValue ? "#1E3A5F" : "#94A3B8"}
        style={{ width: 28 }}
      />
      <Text className="text-sm text-text-secondary w-20">{label}</Text>
      <Text
        className={`flex-1 text-sm ${hasValue ? "text-text-primary" : "text-text-secondary italic"}`}
        numberOfLines={2}
      >
        {hasValue ? value : t("detail_not_available")}
      </Text>
      {isActionable && (
        <Ionicons name="open-outline" size={16} color="#64748B" />
      )}
    </View>
  );

  if (isActionable) {
    return (
      <Pressable
        onPress={() => handlePress(value!, type!)}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Opens ${type === "tel" ? "phone dialer" : type === "email" ? "email client" : "browser"}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
});
```

- [ ] **Step 3: Create InfoTile component**

Create `src/components/detail/InfoTile.tsx`:

```typescript
import { memo } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface InfoTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export const InfoTile = memo(function InfoTile({
  icon,
  label,
  value,
}: InfoTileProps) {
  return (
    <View className="flex-1 items-center bg-bg-light rounded-lg py-3 px-2">
      <Ionicons name={icon} size={20} color="#1E3A5F" />
      <Text className="text-xs text-text-secondary mt-1">{label}</Text>
      <Text
        className="text-sm font-medium text-text-primary mt-0.5 text-center"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/detail/AccordionSection.tsx src/components/detail/ContactRow.tsx src/components/detail/InfoTile.tsx
git commit -m "feat(detail): add AccordionSection, ContactRow, InfoTile components"
```

---

### Task 4: School Detail Screen

**Files:**
- Modify: `app/school/[id].tsx`

- [ ] **Step 1: Implement the full school detail screen**

Replace `app/school/[id].tsx` entirely:

```typescript
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSchoolById } from "@/hooks/useSchoolById";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCompareStore } from "@/stores/useCompareStore";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { Badge } from "@/components/shared/Badge";
import { AccordionSection } from "@/components/detail/AccordionSection";
import { ContactRow } from "@/components/detail/ContactRow";
import { InfoTile } from "@/components/detail/InfoTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { COLORS } from "@/constants/colors";

type Tab = "overview" | "contact";

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { school, loading } = useSchoolById(id ?? "");

  const addCompare = useCompareStore((s) => s.addSchool);
  const isCompared = useCompareStore((s) => s.isSelected(id ?? ""));
  const addShortlist = useShortlistStore((s) => s.addToShortlist);
  const removeShortlist = useShortlistStore((s) => s.removeFromShortlist);
  const isShortlisted = useShortlistStore((s) => s.isShortlisted(id ?? ""));

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({ info: true, religion: false, address: false });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleShortlist = useCallback(() => {
    if (!id) return;
    if (isShortlisted) {
      removeShortlist(id);
    } else {
      addShortlist(id);
    }
  }, [id, isShortlisted, addShortlist, removeShortlist]);

  const handleCompare = useCallback(() => {
    if (!id) return;
    addCompare(id);
    router.push("/compare");
  }, [id, addCompare, router]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "" }} />
        <View className="flex-1 items-center justify-center bg-bg-light">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  if (!school) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "" }} />
        <View className="flex-1 bg-bg-light">
          <EmptyState
            title={t("detail_school_not_found")}
            message={t("detail_go_back")}
            icon="alert-circle-outline"
          />
        </View>
      </>
    );
  }

  const name =
    locale === "tc" ? school.name_tc || school.name_en : school.name_en;
  const subName = locale === "tc" ? school.name_en : school.name_tc;
  const district = locale === "tc" ? school.district_tc : school.district_en;
  const session = locale === "tc" ? school.session_tc : school.session_en;
  const gender =
    locale === "tc" ? school.students_gender_tc : school.students_gender_en;
  const category = locale === "tc" ? school.category_tc : school.category_en;
  const financeType =
    locale === "tc" ? school.finance_type_tc : school.finance_type_en;
  const schoolLevel =
    locale === "tc" ? school.school_level_tc : school.school_level_en;
  const religion = locale === "tc" ? school.religion_tc : school.religion_en;
  const addressEn = school.address_en;
  const addressTc = school.address_tc;

  return (
    <>
      <Stack.Screen options={{ headerTitle: "" }} />
      <View className="flex-1 bg-bg-light">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Hero Banner */}
          <View
            style={{ backgroundColor: COLORS.primary }}
            className="px-4 pt-6 pb-5"
          >
            <Text className="text-xl font-bold text-white" numberOfLines={3}>
              {name}
            </Text>
            {subName ? (
              <Text
                className="text-sm text-white/70 mt-1"
                numberOfLines={2}
              >
                {subName}
              </Text>
            ) : null}
            <View className="flex-row items-center mt-3 gap-2">
              <Badge financeType={school.finance_type_en} locale={locale} />
              <Pressable
                onPress={handleCompare}
                className="flex-row items-center rounded-full px-3 py-1.5 border border-white/40"
                accessibilityRole="button"
                accessibilityLabel={t("detail_compare")}
              >
                <Ionicons
                  name={isCompared ? "checkmark-circle" : "add-circle-outline"}
                  size={16}
                  color="white"
                />
                <Text className="text-xs font-medium text-white ml-1">
                  {t("detail_compare")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Info Strip */}
          <View className="flex-row gap-2 px-4 mt-4">
            <InfoTile
              icon="people-outline"
              label={t("detail_gender")}
              value={gender}
            />
            <InfoTile
              icon="time-outline"
              label={t("detail_session")}
              value={session}
            />
            <InfoTile
              icon="location-outline"
              label={t("detail_district")}
              value={district}
            />
          </View>

          {/* Tab Switcher */}
          <View className="flex-row mx-4 mt-4 mb-3 bg-bg-light rounded-lg overflow-hidden border border-hairline-light">
            <Pressable
              onPress={() => setActiveTab("overview")}
              className={`flex-1 py-2.5 items-center ${activeTab === "overview" ? "bg-primary" : ""}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "overview" }}
            >
              <Text
                className={`text-sm font-medium ${activeTab === "overview" ? "text-white" : "text-text-secondary"}`}
              >
                {t("detail_overview")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("contact")}
              className={`flex-1 py-2.5 items-center ${activeTab === "contact" ? "bg-primary" : ""}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "contact" }}
            >
              <Text
                className={`text-sm font-medium ${activeTab === "contact" ? "text-white" : "text-text-secondary"}`}
              >
                {t("detail_contact")}
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {activeTab === "overview" ? (
            <>
              <AccordionSection
                title={t("detail_school_info")}
                expanded={expandedSections.info ?? true}
                onToggle={() => toggleSection("info")}
              >
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text-secondary">
                      {t("detail_category")}
                    </Text>
                    <Text className="text-sm text-text-primary font-medium">
                      {category}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text-secondary">
                      {t("detail_finance_type")}
                    </Text>
                    <Text className="text-sm text-text-primary font-medium">
                      {financeType}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text-secondary">
                      {t("detail_school_level")}
                    </Text>
                    <Text className="text-sm text-text-primary font-medium">
                      {schoolLevel}
                    </Text>
                  </View>
                </View>
              </AccordionSection>

              <AccordionSection
                title={t("detail_religion")}
                expanded={expandedSections.religion ?? false}
                onToggle={() => toggleSection("religion")}
              >
                <Text className="text-sm text-text-primary">
                  {religion || t("detail_not_available")}
                </Text>
              </AccordionSection>

              <AccordionSection
                title={t("detail_address")}
                expanded={expandedSections.address ?? false}
                onToggle={() => toggleSection("address")}
              >
                <View className="gap-2">
                  {addressEn ? (
                    <Text className="text-sm text-text-primary">
                      {addressEn}
                    </Text>
                  ) : null}
                  {addressTc ? (
                    <Text className="text-sm text-text-primary">
                      {addressTc}
                    </Text>
                  ) : null}
                </View>
              </AccordionSection>
            </>
          ) : (
            <View className="bg-surface-light rounded-xl mx-4 px-4 py-2">
              <ContactRow
                icon="call-outline"
                label={t("detail_telephone")}
                value={school.telephone}
                type="tel"
              />
              <ContactRow
                icon="document-text-outline"
                label={t("detail_fax")}
                value={school.fax}
                type="fax"
              />
              <ContactRow
                icon="globe-outline"
                label={t("detail_website")}
                value={school.website}
                type="url"
              />
            </View>
          )}
        </ScrollView>

        {/* Bottom Sticky Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-4 py-3 bg-surface-light border-t border-hairline-light"
          style={{ paddingBottom: 24 }}
        >
          <Pressable
            onPress={() => {
              if (school.latitude && school.longitude) {
                router.push("/(tabs)/map");
              }
            }}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg border border-primary"
            accessibilityRole="button"
            accessibilityLabel={t("detail_view_on_map")}
          >
            <Ionicons name="map-outline" size={18} color={COLORS.primary} />
            <Text className="text-sm font-medium text-primary ml-2">
              {t("detail_view_on_map")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShortlist}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
            style={{ backgroundColor: COLORS.accent }}
            accessibilityRole="button"
            accessibilityLabel={
              isShortlisted
                ? t("detail_remove_shortlist")
                : t("detail_add_shortlist")
            }
          >
            <Ionicons
              name={isShortlisted ? "heart" : "heart-outline"}
              size={18}
              color="white"
            />
            <Text className="text-sm font-medium text-white ml-2">
              {isShortlisted
                ? t("detail_remove_shortlist")
                : t("detail_add_shortlist")}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
```

- [ ] **Step 2: Verify the screen renders**

Run: `npx expo start -c`

Navigate from Discover to a school card. Expected: School detail screen renders with hero banner, info tiles, accordion sections, and bottom bar.

- [ ] **Step 3: Commit**

```bash
git add app/school/[id].tsx
git commit -m "feat: implement school detail screen with hero, accordions, contacts, shortlist"
```

---

### Task 5: Institution Detail Screen

**Files:**
- Modify: `app/institution/[id].tsx`

- [ ] **Step 1: Implement the full institution detail screen**

Replace `app/institution/[id].tsx` entirely:

```typescript
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  SectionList,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useInstitutionById } from "@/hooks/useInstitutionById";
import { useProgrammesByInstitution } from "@/hooks/useProgrammesByInstitution";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCompareStore } from "@/stores/useCompareStore";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { AccordionSection } from "@/components/detail/AccordionSection";
import { ContactRow } from "@/components/detail/ContactRow";
import { InfoTile } from "@/components/detail/InfoTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { COLORS } from "@/constants/colors";
import type { UgcProgramme } from "@/types/school";

export default function InstitutionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const objectid = Number(id);
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { institution, loading } = useInstitutionById(objectid);

  const shortlistId = `hei-${id}`;
  const addCompare = useCompareStore((s) => s.addSchool);
  const isCompared = useCompareStore((s) => s.isSelected(shortlistId));
  const addShortlist = useShortlistStore((s) => s.addToShortlist);
  const removeShortlist = useShortlistStore((s) => s.removeFromShortlist);
  const isShortlisted = useShortlistStore((s) => s.isShortlisted(shortlistId));

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({ address: true, contact: false, programmes: true });
  const [programmeSearch, setProgrammeSearch] = useState("");

  // Determine if this institution has UGC programmes by matching name
  const universityEn = institution?.facility_name_en ?? "";
  const { programmes, loading: progLoading } = useProgrammesByInstitution(
    universityEn,
    programmeSearch
  );
  const isUgc = programmes.length > 0 || progLoading;

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleShortlist = useCallback(() => {
    if (isShortlisted) {
      removeShortlist(shortlistId);
    } else {
      addShortlist(shortlistId);
    }
  }, [shortlistId, isShortlisted, addShortlist, removeShortlist]);

  const handleCompare = useCallback(() => {
    addCompare(shortlistId);
    router.push("/compare");
  }, [shortlistId, addCompare, router]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "" }} />
        <View className="flex-1 items-center justify-center bg-bg-light">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  if (!institution) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "" }} />
        <View className="flex-1 bg-bg-light">
          <EmptyState
            title={t("detail_institution_not_found")}
            message={t("detail_go_back")}
            icon="alert-circle-outline"
          />
        </View>
      </>
    );
  }

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

  // Group programmes by level of study
  const groupedProgrammes = programmes.reduce<
    Record<string, UgcProgramme[]>
  >((acc, p) => {
    const key =
      locale === "tc" ? p.level_of_study_tc : p.level_of_study_en;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const programmeSections = Object.entries(groupedProgrammes).map(
    ([title, data]) => ({ title, data })
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: "" }} />
      <View className="flex-1 bg-bg-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero Banner */}
          <View
            style={{ backgroundColor: COLORS.primary }}
            className="px-4 pt-6 pb-5"
          >
            <Text className="text-xl font-bold text-white" numberOfLines={3}>
              {name}
            </Text>
            {subName ? (
              <Text
                className="text-sm text-white/70 mt-1"
                numberOfLines={2}
              >
                {subName}
              </Text>
            ) : null}
            <View className="flex-row items-center mt-3 gap-2">
              <View
                style={{
                  backgroundColor: isUgc ? "#D97706" : "#64748B",
                }}
                className="rounded px-2 py-0.5"
              >
                <Text className="text-xs font-medium text-white">
                  {isUgc ? "UGC" : "HEI"}
                </Text>
              </View>
              <Pressable
                onPress={handleCompare}
                className="flex-row items-center rounded-full px-3 py-1.5 border border-white/40"
                accessibilityRole="button"
                accessibilityLabel={t("detail_compare")}
              >
                <Ionicons
                  name={
                    isCompared ? "checkmark-circle" : "add-circle-outline"
                  }
                  size={16}
                  color="white"
                />
                <Text className="text-xs font-medium text-white ml-1">
                  {t("detail_compare")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Info Strip */}
          <View className="flex-row gap-2 px-4 mt-4">
            <InfoTile
              icon="location-outline"
              label={t("detail_address")}
              value={address ? address.substring(0, 40) : "-"}
            />
            {institution.telephone ? (
              <InfoTile
                icon="call-outline"
                label={t("detail_telephone")}
                value={institution.telephone}
              />
            ) : null}
            {institution.website ? (
              <InfoTile
                icon="globe-outline"
                label={t("detail_website")}
                value={
                  institution.website.replace(/^https?:\/\//, "").substring(0, 25)
                }
              />
            ) : null}
          </View>

          {/* Address Section */}
          <View className="mt-4">
            <AccordionSection
              title={t("detail_address")}
              expanded={expandedSections.address ?? true}
              onToggle={() => toggleSection("address")}
            >
              <View className="gap-2">
                {institution.address_en ? (
                  <Text className="text-sm text-text-primary">
                    {institution.address_en}
                  </Text>
                ) : null}
                {institution.address_tc ? (
                  <Text className="text-sm text-text-primary">
                    {institution.address_tc}
                  </Text>
                ) : null}
              </View>
            </AccordionSection>

            {/* Contact Section */}
            <AccordionSection
              title={t("detail_contact")}
              expanded={expandedSections.contact ?? false}
              onToggle={() => toggleSection("contact")}
            >
              <ContactRow
                icon="call-outline"
                label={t("detail_telephone")}
                value={institution.telephone}
                type="tel"
              />
              <ContactRow
                icon="document-text-outline"
                label={t("detail_fax")}
                value={institution.fax}
                type="fax"
              />
              <ContactRow
                icon="mail-outline"
                label={t("detail_email")}
                value={institution.email}
                type="email"
              />
              <ContactRow
                icon="globe-outline"
                label={t("detail_website")}
                value={institution.website}
                type="url"
              />
            </AccordionSection>

            {/* UGC Programmes Section */}
            {isUgc ? (
              <AccordionSection
                title={`${t("detail_programmes")} (${programmes.length})`}
                expanded={expandedSections.programmes ?? true}
                onToggle={() => toggleSection("programmes")}
              >
                {/* Programme Search */}
                <View className="flex-row items-center bg-bg-light rounded-lg px-3 py-2 mb-3">
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color="#64748B"
                  />
                  <TextInput
                    className="flex-1 ml-2 text-sm text-text-primary"
                    placeholder={t("detail_search_programmes")}
                    placeholderTextColor="#94A3B8"
                    value={programmeSearch}
                    onChangeText={setProgrammeSearch}
                    accessibilityLabel={t("detail_search_programmes")}
                  />
                </View>

                {/* Grouped Programme List */}
                {programmeSections.length === 0 && !progLoading ? (
                  <Text className="text-sm text-text-secondary text-center py-4">
                    {t("detail_no_programmes")}
                  </Text>
                ) : (
                  programmeSections.map((section) => (
                    <View key={section.title} className="mb-3">
                      <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                        {section.title}
                      </Text>
                      {section.data.map((prog) => (
                        <View
                          key={prog.objectid}
                          className="py-2 border-b border-hairline-light"
                        >
                          <Text
                            className="text-sm text-text-primary"
                            numberOfLines={2}
                          >
                            {locale === "tc"
                              ? prog.programme_name_tc ||
                                prog.programme_name_en
                              : prog.programme_name_en}
                          </Text>
                          <Text className="text-xs text-text-secondary mt-0.5">
                            {locale === "tc"
                              ? prog.mode_of_study_tc
                              : prog.mode_of_study_en}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </AccordionSection>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom Sticky Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-4 py-3 bg-surface-light border-t border-hairline-light"
          style={{ paddingBottom: 24 }}
        >
          <Pressable
            onPress={() => {
              if (institution.latitude && institution.longitude) {
                router.push("/(tabs)/map");
              }
            }}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg border border-primary"
            accessibilityRole="button"
            accessibilityLabel={t("detail_view_on_map")}
          >
            <Ionicons name="map-outline" size={18} color={COLORS.primary} />
            <Text className="text-sm font-medium text-primary ml-2">
              {t("detail_view_on_map")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShortlist}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
            style={{ backgroundColor: COLORS.accent }}
            accessibilityRole="button"
            accessibilityLabel={
              isShortlisted
                ? t("detail_remove_shortlist")
                : t("detail_add_shortlist")
            }
          >
            <Ionicons
              name={isShortlisted ? "heart" : "heart-outline"}
              size={18}
              color="white"
            />
            <Text className="text-sm font-medium text-white ml-2">
              {isShortlisted
                ? t("detail_remove_shortlist")
                : t("detail_add_shortlist")}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
```

- [ ] **Step 2: Verify the screen renders**

Run the app, switch to University education level, tap an institution card. Expected: Institution detail screen renders with hero banner, info tiles, address/contact accordions, and programme list if UGC.

- [ ] **Step 3: Commit**

```bash
git add app/institution/[id].tsx
git commit -m "feat: implement institution detail screen with programmes, contacts, shortlist"
```

---

### Task 6: Comparison Screen

**Files:**
- Modify: `app/compare/index.tsx`

- [ ] **Step 1: Implement the full comparison screen**

Replace `app/compare/index.tsx` entirely:

```typescript
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { useCompareStore } from "@/stores/useCompareStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { getSchoolById } from "@/repositories/schoolRepository";
import { getInstitutionById } from "@/repositories/heiRepository";
import {
  getProgrammeCountByUniversity,
} from "@/repositories/programmeRepository";
import { EmptyState } from "@/components/shared/EmptyState";
import { COLORS } from "@/constants/colors";
import type { School, HeiInstitution } from "@/types/school";

interface CompareItem {
  id: string;
  type: "school" | "hei";
  name_en: string;
  name_tc: string;
  data: Record<string, string>;
}

const K12_ROWS = [
  { key: "category", labelKey: "detail_category" },
  { key: "finance_type", labelKey: "detail_finance_type" },
  { key: "gender", labelKey: "detail_gender" },
  { key: "session", labelKey: "detail_session" },
  { key: "district", labelKey: "detail_district" },
  { key: "religion", labelKey: "detail_religion" },
];

const HEI_ROWS = [
  { key: "address", labelKey: "detail_address" },
  { key: "telephone", labelKey: "detail_telephone" },
  { key: "website", labelKey: "detail_website" },
  { key: "programme_count", labelKey: "compare_programme_count" },
];

function schoolToCompareItem(s: School): CompareItem {
  return {
    id: s.school_no,
    type: "school",
    name_en: s.name_en,
    name_tc: s.name_tc,
    data: {
      category: s.category_en,
      category_tc: s.category_tc,
      finance_type: s.finance_type_en,
      finance_type_tc: s.finance_type_tc,
      gender: s.students_gender_en,
      gender_tc: s.students_gender_tc,
      session: s.session_en,
      session_tc: s.session_tc,
      district: s.district_en,
      district_tc: s.district_tc,
      religion: s.religion_en,
      religion_tc: s.religion_tc,
    },
  };
}

function heiToCompareItem(
  h: HeiInstitution,
  programmeCount: number
): CompareItem {
  return {
    id: `hei-${h.objectid}`,
    type: "hei",
    name_en: h.facility_name_en,
    name_tc: h.facility_name_tc,
    data: {
      address: h.address_en,
      address_tc: h.address_tc,
      telephone: h.telephone || "",
      website: h.website || "",
      programme_count: String(programmeCount),
    },
  };
}

export default function CompareScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { locale, t } = useLanguage();
  const selectedIds = useCompareStore((s) => s.selectedIds);
  const clearSelection = useCompareStore((s) => s.clearSelection);
  const removeSchool = useCompareStore((s) => s.removeSchool);

  const [items, setItems] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      const results: CompareItem[] = [];

      for (const id of selectedIds) {
        if (id.startsWith("hei-")) {
          const objectid = Number(id.replace("hei-", ""));
          const inst = await getInstitutionById(db, objectid);
          if (inst) {
            const count = await getProgrammeCountByUniversity(
              db,
              inst.facility_name_en
            );
            results.push(heiToCompareItem(inst, count));
          }
        } else {
          const school = await getSchoolById(db, id);
          if (school) {
            results.push(schoolToCompareItem(school));
          }
        }
      }

      if (!cancelled) {
        setItems(results);
        setLoading(false);
      }
    }

    if (selectedIds.length > 0) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [db, selectedIds]);

  const compareType = useMemo(() => {
    if (items.length === 0) return "school";
    return items[0].type;
  }, [items]);

  const rows = compareType === "school" ? K12_ROWS : HEI_ROWS;
  const colWidth = items.length <= 2 ? 160 : 140;

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: t("compare_title") }} />
        <View className="flex-1 items-center justify-center bg-bg-light">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: t("compare_title") }} />
        <View className="flex-1 bg-bg-light justify-center">
          <EmptyState
            title={t("compare_empty")}
            message={t("compare_empty_message")}
            icon="git-compare-outline"
          />
          <Pressable
            onPress={() => router.push("/(tabs)/discover")}
            className="mx-8 mt-4 py-3 rounded-lg items-center"
            style={{ backgroundColor: COLORS.accent }}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-white">
              {t("compare_back_discover")}
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: t("compare_title") }} />
      <View className="flex-1 bg-bg-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Horizontally scrollable comparison table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header Row: names */}
              <View className="flex-row">
                <View
                  className="justify-end px-3 py-3 bg-surface-light border-b border-r border-hairline-light"
                  style={{ width: 100 }}
                >
                  <Text className="text-xs font-semibold text-text-secondary">
                    {compareType === "school" ? "School" : "Institution"}
                  </Text>
                </View>
                {items.map((item) => (
                  <View
                    key={item.id}
                    className="px-3 py-3 bg-surface-light border-b border-r border-hairline-light"
                    style={{ width: colWidth }}
                  >
                    <Text
                      className="text-sm font-semibold text-text-primary"
                      numberOfLines={3}
                    >
                      {locale === "tc"
                        ? item.name_tc || item.name_en
                        : item.name_en}
                    </Text>
                    <Text
                      className="text-xs text-text-secondary mt-0.5"
                      numberOfLines={2}
                    >
                      {locale === "tc" ? item.name_en : item.name_tc}
                    </Text>
                    <Pressable
                      onPress={() => removeSchool(item.id)}
                      className="mt-2"
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name_en}`}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Data Rows */}
              {rows.map((row) => {
                const values = items.map((item) => {
                  const tcKey = `${row.key}_tc`;
                  if (locale === "tc" && item.data[tcKey]) {
                    return item.data[tcKey];
                  }
                  return item.data[row.key] || "-";
                });
                const firstVal = values[0];
                const hasDiff = values.some((v) => v !== firstVal);

                return (
                  <View key={row.key} className="flex-row">
                    <View
                      className="justify-center px-3 py-3 bg-surface-light border-b border-r border-hairline-light"
                      style={{ width: 100 }}
                    >
                      <Text className="text-xs font-medium text-text-secondary">
                        {t(row.labelKey)}
                      </Text>
                    </View>
                    {values.map((val, idx) => {
                      const isDiff =
                        hasDiff && val !== firstVal;
                      return (
                        <View
                          key={items[idx].id}
                          className="justify-center px-3 py-3 border-b border-r border-hairline-light"
                          style={{
                            width: colWidth,
                            backgroundColor: isDiff
                              ? COLORS.diffHighlight
                              : COLORS.light.surface,
                          }}
                        >
                          <Text
                            className="text-sm text-text-primary"
                            numberOfLines={3}
                          >
                            {val}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        {/* Bottom Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-4 py-3 bg-surface-light border-t border-hairline-light"
          style={{ paddingBottom: 24 }}
        >
          <Pressable
            onPress={() => router.push("/(tabs)/discover")}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg border border-primary"
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-primary">
              {t("compare_back_discover")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              clearSelection();
              router.back();
            }}
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg bg-red-500"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text className="text-sm font-medium text-white ml-1">
              {t("compare_clear")}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
```

- [ ] **Step 2: Verify comparison screen**

Run the app. From Discover, tap the compare button on 2 school cards. Then navigate to the Compare screen. Expected: Side-by-side table shows with amber diff highlights on differing values.

- [ ] **Step 3: Commit**

```bash
git add app/compare/index.tsx
git commit -m "feat: implement comparison screen with diff-highlighted side-by-side table"
```

---

### Task 7: Verify App Launches Without Errors

**Files:** None (verification only)

- [ ] **Step 1: Clear cache and start the app**

Run:

```bash
cd hk-school-finder && npx expo start -c
```

Expected: The app launches without uncaught errors. The Metro bundler shows no red errors.

- [ ] **Step 2: Test core navigation flows**

1. Discover tab loads with school list
2. Tap a school card -> School detail screen renders with all sections
3. Tap back -> Returns to Discover
4. Switch to University tab -> Institution list loads
5. Tap an institution card -> Institution detail screen renders
6. Tap Compare button on detail -> Compare screen loads
7. Tap Clear All on Compare -> Returns with empty compare state
8. On detail screen, tap Add to Shortlist -> Heart fills

- [ ] **Step 3: Fix any uncaught errors**

If any of the 4 previously reported errors persist, investigate and fix them. Common causes:
- Missing imports or circular dependencies
- NativeWind class names not recognized (check tailwind.config.js content paths)
- Reanimated worklet issues (check babel.config.js)
- expo-sqlite context not available (check provider hierarchy in app/_layout.tsx)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve uncaught errors from Plan 3 and Plan 4 integration"
```
