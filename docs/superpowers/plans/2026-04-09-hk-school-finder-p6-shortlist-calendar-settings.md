# HK School Finder - Plan 6: Shortlist, Calendar & Settings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Shortlist tab (saved schools with status stepper), Calendar tab (month grid, events CRUD, demo seeds, notifications, calendar export), and Settings tab (language, theme, notifications, data management) -- completing all remaining screens in the app.

**Architecture:** Shortlist fetches school/institution details from SQLite by IDs stored in MMKV (Zustand). Calendar uses a month-based grid with SQLite-backed CRUD events, local notifications via `expo-notifications`, and system calendar export via `expo-calendar`. Settings uses MMKV for all preferences. All screens follow the existing NativeWind + Zustand + repository patterns.

**Tech Stack:** Expo SDK 55, expo-sqlite, Zustand + MMKV, expo-notifications, expo-calendar, @shopify/flash-list v2, NativeWind v4

**Spec Reference:** `docs/superpowers/specs/2026-04-08-hk-school-finder-design.md` (Sections 7.7, 7.8, 7.9)

---

## File Structure (this plan creates/modifies)

```
hk-school-finder/
  assets/
    data/
      demo-calendar-events.json       -- 15 demo events for seeding
  src/
    i18n/
      en.json                          -- Add ~40 new keys
      tc.json                          -- Add ~40 new keys
    repositories/
      schoolRepository.ts              -- Add getSchoolsByIds()
      heiRepository.ts                 -- Add getInstitutionsByIds()
    hooks/
      useShortlistedItems.ts           -- Fetch shortlisted school/institution details
      useNotifications.ts              -- Schedule/cancel local notifications
      useCalendarExport.ts             -- Export event to system calendar
    components/
      shortlist/
        StatusStepper.tsx              -- 4-stage horizontal stepper
      calendar/
        CalendarGrid.tsx               -- 7-column month grid
        EventCard.tsx                  -- Event list item with actions
        EventForm.tsx                  -- Shared create/edit form
    db/
      seed.ts                          -- Add seedCalendarEvents()
  app/
    (tabs)/
      shortlist/
        index.tsx                      -- Replace placeholder
      calendar/
        index.tsx                      -- Replace placeholder
      settings/
        index.tsx                      -- Replace placeholder
    event/
      [id].tsx                         -- Replace placeholder
      create.tsx                       -- Replace placeholder
```

---

### Task 1: Add i18n Translation Keys

**Files:**
- Modify: `hk-school-finder/src/i18n/en.json`
- Modify: `hk-school-finder/src/i18n/tc.json`

- [ ] **Step 1: Add English keys**

Append these keys to `hk-school-finder/src/i18n/en.json` before the closing `}`:

```json
  "shortlist_stage_interested": "Interested",
  "shortlist_stage_visited": "Visited",
  "shortlist_stage_applied": "Applied",
  "shortlist_stage_result": "Result",
  "shortlist_remove": "Remove",
  "calendar_create": "New Event",
  "calendar_edit": "Edit Event",
  "calendar_delete": "Delete Event",
  "calendar_delete_confirm": "Are you sure you want to delete this event?",
  "calendar_delete_yes": "Delete",
  "calendar_delete_no": "Cancel",
  "calendar_title": "Title",
  "calendar_date": "Date",
  "calendar_time": "Time (optional)",
  "calendar_category": "Category",
  "calendar_description": "Description (optional)",
  "calendar_reminder": "Set Reminder",
  "calendar_save": "Save",
  "calendar_cancel": "Cancel",
  "calendar_add_to_calendar": "Add to Calendar",
  "calendar_exported": "Added to calendar",
  "calendar_no_permission": "Calendar permission denied",
  "settings_display": "Display",
  "settings_language": "Language",
  "settings_english": "English",
  "settings_chinese": "Traditional Chinese",
  "settings_appearance": "Appearance",
  "settings_light": "Light",
  "settings_dark": "Dark",
  "settings_system": "System",
  "settings_notifications": "Notifications",
  "settings_admission_reminders": "Admission Reminders",
  "settings_open_day_alerts": "Open Day Alerts",
  "settings_data": "Data",
  "settings_cached_data": "Cached Data",
  "settings_last_updated": "Last updated: {date}",
  "settings_refresh": "Refresh Data",
  "settings_clear_all": "Clear All Data",
  "settings_clear_confirm": "This will delete all cached data and preferences. Are you sure?",
  "settings_clear_yes": "Clear All",
  "settings_clear_no": "Cancel",
  "settings_about": "About",
  "settings_data_sources": "Data Sources",
  "settings_data_attribution": "DATA.GOV.HK Open Data",
  "settings_version": "App Version"
```

- [ ] **Step 2: Add Traditional Chinese keys**

Append matching keys to `hk-school-finder/src/i18n/tc.json`:

```json
  "shortlist_stage_interested": "有興趣",
  "shortlist_stage_visited": "已參觀",
  "shortlist_stage_applied": "已申請",
  "shortlist_stage_result": "已放榜",
  "shortlist_remove": "移除",
  "calendar_create": "新增活動",
  "calendar_edit": "編輯活動",
  "calendar_delete": "刪除活動",
  "calendar_delete_confirm": "確定要刪除此活動嗎？",
  "calendar_delete_yes": "刪除",
  "calendar_delete_no": "取消",
  "calendar_title": "標題",
  "calendar_date": "日期",
  "calendar_time": "時間（選填）",
  "calendar_category": "類別",
  "calendar_description": "描述（選填）",
  "calendar_reminder": "設定提醒",
  "calendar_save": "儲存",
  "calendar_cancel": "取消",
  "calendar_add_to_calendar": "加入日曆",
  "calendar_exported": "已加入日曆",
  "calendar_no_permission": "日曆權限被拒絕",
  "settings_display": "顯示",
  "settings_language": "語言",
  "settings_english": "English",
  "settings_chinese": "繁體中文",
  "settings_appearance": "外觀",
  "settings_light": "淺色",
  "settings_dark": "深色",
  "settings_system": "系統",
  "settings_notifications": "通知",
  "settings_admission_reminders": "入學提醒",
  "settings_open_day_alerts": "開放日提醒",
  "settings_data": "資料",
  "settings_cached_data": "快取資料",
  "settings_last_updated": "最後更新：{date}",
  "settings_refresh": "重新載入資料",
  "settings_clear_all": "清除所有資料",
  "settings_clear_confirm": "此操作將刪除所有快取資料及偏好設定，確定嗎？",
  "settings_clear_yes": "全部清除",
  "settings_clear_no": "取消",
  "settings_about": "關於",
  "settings_data_sources": "資料來源",
  "settings_data_attribution": "DATA.GOV.HK 開放資料",
  "settings_version": "應用程式版本"
```

- [ ] **Step 3: Verify JSON validity**

```bash
cd hk-school-finder
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8')); console.log('en OK')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/tc.json','utf8')); console.log('tc OK')"
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.json src/i18n/tc.json
git commit -m "feat(p6): add i18n keys for shortlist, calendar, and settings screens"
```

---

### Task 2: Add Batch Query Functions and useShortlistedItems Hook

**Files:**
- Modify: `hk-school-finder/src/repositories/schoolRepository.ts`
- Modify: `hk-school-finder/src/repositories/heiRepository.ts`
- Create: `hk-school-finder/src/hooks/useShortlistedItems.ts`

- [ ] **Step 1: Add getSchoolsByIds to schoolRepository.ts**

Append to the end of `hk-school-finder/src/repositories/schoolRepository.ts`:

```typescript
export async function getSchoolsByIds(
  db: SQLiteDatabase,
  ids: string[]
): Promise<School[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return db.getAllAsync<School>(
    `SELECT * FROM schools WHERE school_no IN (${placeholders})`,
    ids
  );
}
```

- [ ] **Step 2: Add getInstitutionsByIds to heiRepository.ts**

Append to the end of `hk-school-finder/src/repositories/heiRepository.ts`:

```typescript
export async function getInstitutionsByIds(
  db: SQLiteDatabase,
  ids: number[]
): Promise<HeiInstitution[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return db.getAllAsync<HeiInstitution>(
    `SELECT * FROM hei_institutions WHERE objectid IN (${placeholders})`,
    ids
  );
}
```

- [ ] **Step 3: Create useShortlistedItems hook**

Create `hk-school-finder/src/hooks/useShortlistedItems.ts`:

```typescript
import { useEffect, useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { getSchoolsByIds } from "@/repositories/schoolRepository";
import { getInstitutionsByIds } from "@/repositories/heiRepository";
import type { School } from "@/types/school";
import type { HeiInstitution } from "@/types/school";

export type ShortlistItem =
  | { type: "school"; data: School }
  | { type: "institution"; data: HeiInstitution };

export function useShortlistedItems() {
  const db = useSQLiteContext();
  const shortlistedIds = useShortlistStore((s) => s.shortlistedIds);
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (shortlistedIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const schools = await getSchoolsByIds(db, shortlistedIds);
    const schoolIdSet = new Set(schools.map((s) => s.school_no));

    const remainingIds = shortlistedIds
      .filter((id) => !schoolIdSet.has(id))
      .map(Number)
      .filter((n) => !isNaN(n));
    const institutions = await getInstitutionsByIds(db, remainingIds);
    const instMap = new Map(institutions.map((i) => [String(i.objectid), i]));
    const schoolMap = new Map(schools.map((s) => [s.school_no, s]));

    // Preserve shortlist order
    const ordered: ShortlistItem[] = [];
    for (const id of shortlistedIds) {
      const school = schoolMap.get(id);
      if (school) {
        ordered.push({ type: "school", data: school });
        continue;
      }
      const inst = instMap.get(id);
      if (inst) {
        ordered.push({ type: "institution", data: inst });
      }
    }

    setItems(ordered);
    setLoading(false);
  }, [db, shortlistedIds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/repositories/schoolRepository.ts src/repositories/heiRepository.ts src/hooks/useShortlistedItems.ts
git commit -m "feat(shortlist): add batch queries and useShortlistedItems hook"
```

---

### Task 3: Create StatusStepper Component

**Files:**
- Create: `hk-school-finder/src/components/shortlist/StatusStepper.tsx`

A horizontal 4-step stepper showing application stages. Active stage is amber, inactive is grey. Tapping a step sets it in `useStatusTrackerStore`.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/shortlist/StatusStepper.tsx`:

```typescript
import { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useStatusTrackerStore, type ApplicationStage } from "@/stores/useStatusTrackerStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";

const STAGES: { key: ApplicationStage; i18nKey: string }[] = [
  { key: "interested", i18nKey: "shortlist_stage_interested" },
  { key: "visited", i18nKey: "shortlist_stage_visited" },
  { key: "applied", i18nKey: "shortlist_stage_applied" },
  { key: "result", i18nKey: "shortlist_stage_result" },
];

interface StatusStepperProps {
  schoolId: string;
}

export const StatusStepper = memo(function StatusStepper({ schoolId }: StatusStepperProps) {
  const { t } = useLanguage();
  const currentStage = useStatusTrackerStore((s) => s.stages[schoolId]);
  const setStage = useStatusTrackerStore((s) => s.setStage);

  const currentIndex = currentStage
    ? STAGES.findIndex((s) => s.key === currentStage)
    : -1;

  const handlePress = useCallback(
    (stage: ApplicationStage) => {
      setStage(schoolId, stage);
    },
    [schoolId, setStage]
  );

  return (
    <View style={styles.container}>
      {STAGES.map((stage, index) => {
        const isActive = index <= currentIndex;
        const isLast = index === STAGES.length - 1;
        return (
          <View key={stage.key} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              <Pressable
                onPress={() => handlePress(stage.key)}
                style={[
                  styles.circle,
                  { backgroundColor: isActive ? COLORS.accent : COLORS.light.hairline },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t(stage.i18nKey)}
                accessibilityState={{ selected: isActive }}
              >
                {isActive ? (
                  <Ionicons name="checkmark" size={12} color={COLORS.light.surface} />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </Pressable>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: index < currentIndex ? COLORS.accent : COLORS.light.hairline },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? COLORS.accent : COLORS.light.textSecondary },
              ]}
              numberOfLines={1}
            >
              {t(stage.i18nKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  stepWrapper: {
    flex: 1,
    alignItems: "center",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 2,
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shortlist/StatusStepper.tsx
git commit -m "feat(shortlist): add StatusStepper component"
```

---

### Task 4: Implement ShortlistScreen

**Files:**
- Modify: `hk-school-finder/app/(tabs)/shortlist/index.tsx`

Shows shortlisted schools/institutions with status stepper, or empty state.

- [ ] **Step 1: Replace the shortlist screen**

Replace `hk-school-finder/app/(tabs)/shortlist/index.tsx`:

```typescript
import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useShortlistedItems, type ShortlistItem } from "@/hooks/useShortlistedItems";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { Badge } from "@/components/shared/Badge";
import { StatusStepper } from "@/components/shortlist/StatusStepper";
import { EmptyState } from "@/components/shared/EmptyState";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

export default function ShortlistScreen() {
  const { items, loading } = useShortlistedItems();
  const removeFromShortlist = useShortlistStore((s) => s.removeFromShortlist);
  const { locale, t } = useLanguage();
  const router = useRouter();

  const renderItem = useCallback(
    ({ item }: { item: ShortlistItem }) => {
      if (item.type === "school") {
        const s = item.data;
        const name = locale === "tc" ? s.name_tc || s.name_en : s.name_en;
        const subName = locale === "tc" ? s.name_en : s.name_tc;
        return (
          <View className="bg-surface-light rounded-xl mx-4 mb-3 p-4"
            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Pressable
              onPress={() => router.push(`/school/${s.school_no}`)}
              accessibilityRole="button"
              accessibilityLabel={s.name_en}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-semibold text-text-primary" numberOfLines={2}>{name}</Text>
                  {subName ? <Text className="text-sm text-text-secondary mt-0.5" numberOfLines={1}>{subName}</Text> : null}
                </View>
                <Badge financeType={s.finance_type_en} locale={locale} />
              </View>
              <Text className="text-xs text-text-secondary mt-1">
                {locale === "tc" ? s.district_tc : s.district_en}
              </Text>
            </Pressable>
            <StatusStepper schoolId={s.school_no} />
            <Pressable
              onPress={() => removeFromShortlist(s.school_no)}
              className="flex-row items-center justify-center mt-1 py-2"
              accessibilityRole="button"
              accessibilityLabel={t("shortlist_remove")}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.light.textSecondary} />
              <Text className="text-xs text-text-secondary ml-1">{t("shortlist_remove")}</Text>
            </Pressable>
          </View>
        );
      }
      // Institution
      const inst = item.data;
      const name = locale === "tc" ? inst.facility_name_tc || inst.facility_name_en : inst.facility_name_en;
      return (
        <View className="bg-surface-light rounded-xl mx-4 mb-3 p-4"
          style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Pressable
            onPress={() => router.push(`/institution/${inst.objectid}`)}
            accessibilityRole="button"
            accessibilityLabel={inst.facility_name_en}
          >
            <Text className="text-base font-semibold text-text-primary" numberOfLines={2}>{name}</Text>
          </Pressable>
          <StatusStepper schoolId={String(inst.objectid)} />
          <Pressable
            onPress={() => removeFromShortlist(String(inst.objectid))}
            className="flex-row items-center justify-center mt-1 py-2"
            accessibilityRole="button"
            accessibilityLabel={t("shortlist_remove")}
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.light.textSecondary} />
            <Text className="text-xs text-text-secondary ml-1">{t("shortlist_remove")}</Text>
          </Pressable>
        </View>
      );
    },
    [locale, router, removeFromShortlist, t]
  );

  const keyExtractor = useCallback(
    (item: ShortlistItem) =>
      item.type === "school" ? item.data.school_no : String(item.data.objectid),
    []
  );

  if (!loading && items.length === 0) {
    return (
      <View className="flex-1 bg-bg-light">
        <EmptyState
          title={t("shortlist_empty")}
          message={t("shortlist_empty_cta")}
          icon="heart-outline"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-light">
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
      />
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/shortlist/index.tsx
git commit -m "feat(shortlist): implement shortlist screen with status stepper"
```

---

### Task 5: Create EventCard Component

**Files:**
- Create: `hk-school-finder/src/components/calendar/EventCard.tsx`

Event list item with colour-coded left stripe, title, date/time, category badge, bell icon, and calendar export icon.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/calendar/EventCard.tsx`:

```typescript
import { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent } from "@/types/calendar";

interface EventCardProps {
  event: CalendarEvent;
  onToggleReminder: (eventId: string, enabled: boolean) => void;
  onExportCalendar: (event: CalendarEvent) => void;
}

export const EventCard = memo(function EventCard({
  event,
  onToggleReminder,
  onExportCalendar,
}: EventCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const categoryConfig = EVENT_CATEGORIES[event.category];
  const categoryLabel = locale === "tc" ? categoryConfig.labelTc : categoryConfig.labelEn;

  const handlePress = useCallback(() => {
    router.push(`/event/${event.id}`);
  }, [router, event.id]);

  const handleToggleReminder = useCallback(() => {
    onToggleReminder(event.id, !event.reminder_enabled);
  }, [event.id, event.reminder_enabled, onToggleReminder]);

  const handleExport = useCallback(() => {
    onExportCalendar(event);
  }, [event, onExportCalendar]);

  const timeDisplay = event.event_time
    ? event.event_time
    : "";

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, { borderLeftColor: categoryConfig.color }]}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.event_date}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <View style={[styles.badge, { backgroundColor: categoryConfig.color }]}>
            <Text style={styles.badgeText}>{categoryLabel}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {event.event_date}{timeDisplay ? ` ${timeDisplay}` : ""}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={handleToggleReminder}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Toggle reminder"
        >
          <Ionicons
            name={event.reminder_enabled ? "notifications" : "notifications-outline"}
            size={18}
            color={event.reminder_enabled ? COLORS.accent : COLORS.light.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={handleExport}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Add to calendar"
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.light.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.surface,
    borderLeftWidth: 4,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.textPrimary,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
  date: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/EventCard.tsx
git commit -m "feat(calendar): add EventCard component"
```

---

### Task 6: Create CalendarGrid Component

**Files:**
- Create: `hk-school-finder/src/components/calendar/CalendarGrid.tsx`

A 7-column month grid. Dots appear on days that have events. Today is highlighted. Tapping a day calls `onSelectDay`.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/calendar/CalendarGrid.tsx`:

```typescript
import { memo, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent } from "@/types/calendar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  events: CalendarEvent[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const CalendarGrid = memo(function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onSelectDay,
}: CalendarGridProps) {
  const cells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const eventDays = useMemo(() => {
    const days = new Set<number>();
    for (const e of events) {
      const day = parseInt(e.event_date.split("-")[2], 10);
      if (!isNaN(day)) days.add(day);
    }
    return days;
  }, [events]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  return (
    <View style={styles.container}>
      {/* Day-of-week header */}
      <View style={styles.row}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <Text style={styles.headerText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            const key = `${rowIdx}-${colIdx}`;
            if (day === null) {
              return <View key={key} style={styles.cell} />;
            }
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const hasEvents = eventDays.has(day);
            return (
              <Pressable
                key={key}
                style={[
                  styles.cell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => onSelectDay(day)}
                accessibilityRole="button"
                accessibilityLabel={`${year}-${month}-${day}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {day}
                </Text>
                {hasEvents && (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.light.textSecondary,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 44,
  },
  todayCell: {
    backgroundColor: "rgba(30, 58, 95, 0.1)",
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.light.textPrimary,
  },
  todayText: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  selectedText: {
    fontWeight: "700",
    color: COLORS.light.surface,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: COLORS.light.surface,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/CalendarGrid.tsx
git commit -m "feat(calendar): add CalendarGrid month grid component"
```

---

### Task 7: Implement CalendarScreen

**Files:**
- Modify: `hk-school-finder/app/(tabs)/calendar/index.tsx`

Assembles month navigation, CalendarGrid, events list (FlashList), and FAB "+" button.

- [ ] **Step 1: Replace the calendar screen**

Replace `hk-school-finder/app/(tabs)/calendar/index.tsx`:

```typescript
import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import * as Notifications from "expo-notifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { updateEvent } from "@/repositories/calendarRepository";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventCard } from "@/components/calendar/EventCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent } from "@/types/calendar";

const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_TC = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const db = useSQLiteContext();
  const { events, loading, refresh } = useCalendarEvents(year, month);
  const { locale, t } = useLanguage();
  const router = useRouter();

  const monthNames = locale === "tc" ? MONTH_NAMES_TC : MONTH_NAMES_EN;

  const goToPrevMonth = useCallback(() => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else { setMonth((m) => m - 1); }
    setSelectedDay(null);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else { setMonth((m) => m + 1); }
    setSelectedDay(null);
  }, [month]);

  const filteredEvents = useMemo(() => {
    if (selectedDay === null) return events;
    const dayStr = String(selectedDay).padStart(2, "0");
    const monthStr = String(month).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    return events.filter((e) => e.event_date === dateStr);
  }, [events, selectedDay, year, month]);

  const handleToggleReminder = useCallback(
    async (eventId: string, enabled: boolean) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      await updateEvent(db, eventId, {
        title: event.title,
        description: event.description ?? undefined,
        event_date: event.event_date,
        event_time: event.event_time ?? undefined,
        category: event.category,
        school_no: event.school_no ?? undefined,
        reminder_enabled: enabled,
      });
      // Schedule or cancel local notification
      if (enabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          const triggerDate = new Date(event.event_date);
          triggerDate.setDate(triggerDate.getDate() - 1);
          triggerDate.setHours(9, 0, 0, 0);
          if (triggerDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: { title: event.title, body: `Tomorrow: ${event.title}` },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
              identifier: `reminder-${eventId}`,
            });
          }
        }
      } else {
        await Notifications.cancelScheduledNotificationAsync(`reminder-${eventId}`);
      }
      refresh();
    },
    [db, events, refresh]
  );

  const handleExportCalendar = useCallback(async (event: CalendarEvent) => {
    try {
      const ExpoCalendar = await import("expo-calendar");
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("calendar_no_permission"));
        return;
      }
      const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
      const cal = calendars.find((c) => c.isPrimary) ?? calendars[0];
      if (!cal) return;
      const startDate = new Date(`${event.event_date}T${event.event_time || "09:00"}`);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      await ExpoCalendar.createEventAsync(cal.id, {
        title: event.title,
        notes: event.description ?? undefined,
        startDate,
        endDate,
      });
      Alert.alert(t("calendar_exported"));
    } catch {
      Alert.alert(t("calendar_no_permission"));
    }
  }, [t]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={goToPrevMonth} style={styles.navBtn} accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {monthNames[month - 1]} {year}
          </Text>
          <Pressable onPress={goToNextMonth} style={styles.navBtn} accessibilityLabel="Next month">
            <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Calendar grid */}
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* Events list */}
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>
            {selectedDay
              ? `${monthNames[month - 1]} ${selectedDay}`
              : t("tab_calendar")}
          </Text>
          <Text style={styles.eventsCount}>
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          </Text>
        </View>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title={t("calendar_empty")}
            message=""
            icon="calendar-outline"
          />
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggleReminder={handleToggleReminder}
              onExportCalendar={handleExportCalendar}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/event/create")}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel={t("calendar_create")}
      >
        <Ionicons name="add" size={28} color={COLORS.light.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.light.textPrimary,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.textPrimary,
  },
  eventsCount: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/calendar/index.tsx
git commit -m "feat(calendar): implement calendar screen with grid, events, and FAB"
```

---

### Task 8: Create EventForm Component

**Files:**
- Create: `hk-school-finder/src/components/calendar/EventForm.tsx`

Shared form used by both create and edit screens. Contains title, date, time, category picker, description, and reminder toggle.

- [ ] **Step 1: Create the component**

Create `hk-school-finder/src/components/calendar/EventForm.tsx`:

```typescript
import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Switch } from "react-native";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { EventCategory, CalendarEventInput } from "@/types/calendar";

const CATEGORIES: EventCategory[] = ["poa", "kg", "open_day", "sspa", "custom"];

interface EventFormProps {
  initialValues?: Partial<CalendarEventInput>;
  onSubmit: (input: CalendarEventInput) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function EventForm({ initialValues, onSubmit, onCancel, submitLabel }: EventFormProps) {
  const { locale, t } = useLanguage();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [eventDate, setEventDate] = useState(initialValues?.event_date ?? "");
  const [eventTime, setEventTime] = useState(initialValues?.event_time ?? "");
  const [category, setCategory] = useState<EventCategory>(initialValues?.category ?? "custom");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(initialValues?.reminder_enabled ?? false);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !eventDate.trim()) return;
    onSubmit({
      title: title.trim(),
      event_date: eventDate.trim(),
      event_time: eventTime.trim() || undefined,
      category,
      description: description.trim() || undefined,
      reminder_enabled: reminderEnabled,
    });
  }, [title, eventDate, eventTime, category, description, reminderEnabled, onSubmit]);

  const isValid = title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(eventDate.trim());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.label}>{t("calendar_title")}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder={t("calendar_title")}
        placeholderTextColor={COLORS.light.textSecondary}
        accessibilityLabel={t("calendar_title")}
      />

      {/* Date */}
      <Text style={styles.label}>{t("calendar_date")}</Text>
      <TextInput
        value={eventDate}
        onChangeText={setEventDate}
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={COLORS.light.textSecondary}
        keyboardType="numbers-and-punctuation"
        accessibilityLabel={t("calendar_date")}
      />

      {/* Time */}
      <Text style={styles.label}>{t("calendar_time")}</Text>
      <TextInput
        value={eventTime}
        onChangeText={setEventTime}
        style={styles.input}
        placeholder="HH:MM"
        placeholderTextColor={COLORS.light.textSecondary}
        keyboardType="numbers-and-punctuation"
        accessibilityLabel={t("calendar_time")}
      />

      {/* Category */}
      <Text style={styles.label}>{t("calendar_category")}</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const config = EVENT_CATEGORIES[cat];
          const label = locale === "tc" ? config.labelTc : config.labelEn;
          const isActive = category === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                { borderColor: config.color },
                isActive && { backgroundColor: config.color },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.categoryText, isActive && { color: COLORS.light.surface }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Description */}
      <Text style={styles.label}>{t("calendar_description")}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        placeholder={t("calendar_description")}
        placeholderTextColor={COLORS.light.textSecondary}
        multiline
        numberOfLines={3}
        accessibilityLabel={t("calendar_description")}
      />

      {/* Reminder */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t("calendar_reminder")}</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ true: COLORS.accent, false: COLORS.light.hairline }}
          thumbColor={COLORS.light.surface}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable onPress={onCancel} style={styles.cancelBtn} accessibilityRole="button">
          <Text style={styles.cancelText}>{t("calendar_cancel")}</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          style={[styles.submitBtn, !isValid && styles.submitDisabled]}
          disabled={!isValid}
          accessibilityRole="button"
        >
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.light.surface,
    borderWidth: 1,
    borderColor: COLORS.light.hairline,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.light.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.light.textPrimary,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.light.textPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.light.hairline,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.textSecondary,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/EventForm.tsx
git commit -m "feat(calendar): add EventForm shared component"
```

---

### Task 9: Implement CreateEventScreen

**Files:**
- Modify: `hk-school-finder/app/event/create.tsx`

- [ ] **Step 1: Replace the create event screen**

Replace `hk-school-finder/app/event/create.tsx`:

```typescript
import { useCallback } from "react";
import { View } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { createEvent } from "@/repositories/calendarRepository";
import { EventForm } from "@/components/calendar/EventForm";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEventInput } from "@/types/calendar";

export default function CreateEventScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = useCallback(
    async (input: CalendarEventInput) => {
      await createEvent(db, input);
      router.back();
    },
    [db, router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: t("calendar_create") }} />
      <View style={{ flex: 1, backgroundColor: COLORS.light.background }}>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={t("calendar_save")}
        />
      </View>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/event/create.tsx
git commit -m "feat(calendar): implement create event screen"
```

---

### Task 10: Implement EventDetailScreen

**Files:**
- Modify: `hk-school-finder/app/event/[id].tsx`

Shows event details with edit form, delete button, and actions. Supports view and edit mode.

- [ ] **Step 1: Replace the event detail screen**

Replace `hk-school-finder/app/event/[id].tsx`:

```typescript
import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getEventById, updateEvent, deleteEvent } from "@/repositories/calendarRepository";
import { EventForm } from "@/components/calendar/EventForm";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent, CalendarEventInput } from "@/types/calendar";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(db, id).then((e) => {
      setEvent(e);
      setLoading(false);
    });
  }, [db, id]);

  const handleUpdate = useCallback(
    async (input: CalendarEventInput) => {
      if (!id) return;
      await updateEvent(db, id, input);
      const updated = await getEventById(db, id);
      setEvent(updated);
      setEditing(false);
    },
    [db, id]
  );

  const handleDelete = useCallback(() => {
    Alert.alert(t("calendar_delete"), t("calendar_delete_confirm"), [
      { text: t("calendar_delete_no"), style: "cancel" },
      {
        text: t("calendar_delete_yes"),
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          await deleteEvent(db, id);
          router.back();
        },
      },
    ]);
  }, [db, id, router, t]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <View style={styles.center}>
          <Text style={styles.notFound}>{t("no_results")}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.goBack}>{t("detail_go_back")}</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (editing) {
    return (
      <>
        <Stack.Screen options={{ title: t("calendar_edit") }} />
        <View style={{ flex: 1, backgroundColor: COLORS.light.background }}>
          <EventForm
            initialValues={{
              title: event.title,
              event_date: event.event_date,
              event_time: event.event_time ?? undefined,
              category: event.category,
              description: event.description ?? undefined,
              reminder_enabled: event.reminder_enabled,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel={t("calendar_save")}
          />
        </View>
      </>
    );
  }

  const categoryConfig = EVENT_CATEGORIES[event.category];
  const categoryLabel = locale === "tc" ? categoryConfig.labelTc : categoryConfig.labelEn;

  return (
    <>
      <Stack.Screen
        options={{
          title: t("screen_event_detail"),
          headerRight: () => (
            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={COLORS.light.surface} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Category stripe */}
        <View style={[styles.categoryStripe, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.categoryLabel}>{categoryLabel}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.light.textSecondary} />
            <Text style={styles.infoText}>{event.event_date}</Text>
          </View>
          {event.event_time ? (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.light.textSecondary} />
              <Text style={styles.infoText}>{event.event_time}</Text>
            </View>
          ) : null}
          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons
              name={event.reminder_enabled ? "notifications" : "notifications-outline"}
              size={16}
              color={event.reminder_enabled ? COLORS.accent : COLORS.light.textSecondary}
            />
            <Text style={styles.infoText}>
              {t("calendar_reminder")}: {event.reminder_enabled ? "On" : "Off"}
            </Text>
          </View>
        </View>

        {/* Delete button */}
        <Pressable
          onPress={handleDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={t("calendar_delete")}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteText}>{t("calendar_delete")}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.light.background,
  },
  notFound: {
    fontSize: 16,
    color: COLORS.light.textSecondary,
    marginBottom: 12,
  },
  goBack: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  categoryStripe: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.light.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.light.textSecondary,
  },
  description: {
    fontSize: 15,
    color: COLORS.light.textPrimary,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 22,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 10,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/event/[id].tsx
git commit -m "feat(calendar): implement event detail screen with edit and delete"
```

---

### Task 11: Create Demo Event Seed Data and Integrate with Seeding

**Files:**
- Create: `hk-school-finder/assets/data/demo-calendar-events.json`
- Modify: `hk-school-finder/src/db/seed.ts`

- [ ] **Step 1: Create the demo events JSON**

Create `hk-school-finder/assets/data/demo-calendar-events.json`:

```json
[
  { "title": "POA Application Opens", "event_date": "2026-09-01", "event_time": "09:00", "category": "poa", "description": "Primary One Admission (POA) application period begins" },
  { "title": "POA Submission Deadline", "event_date": "2026-09-30", "event_time": "17:00", "category": "poa", "description": "Last day to submit POA application forms" },
  { "title": "POA Interview Period", "event_date": "2026-11-01", "category": "poa", "description": "Schools begin conducting POA interviews" },
  { "title": "POA Results Announcement", "event_date": "2026-11-28", "event_time": "10:00", "category": "poa", "description": "POA allocation results released" },
  { "title": "KG Admission Application Opens", "event_date": "2026-09-08", "event_time": "09:00", "category": "kg", "description": "Kindergarten admission application period begins" },
  { "title": "KG Application Deadline", "event_date": "2026-10-15", "event_time": "17:00", "category": "kg", "description": "Last day to submit KG admission applications" },
  { "title": "KG Interview Results", "event_date": "2026-12-10", "category": "kg", "description": "KG admission interview results released" },
  { "title": "St. Paul School Open Day", "event_date": "2026-10-18", "event_time": "10:00", "category": "open_day", "description": "Annual open day at St. Paul School" },
  { "title": "DBS Open Day", "event_date": "2026-10-25", "event_time": "09:30", "category": "open_day", "description": "Diocesan Boys School open day" },
  { "title": "SPCC Open Day", "event_date": "2026-11-08", "event_time": "10:00", "category": "open_day", "description": "St. Paul Co-Educational College open day" },
  { "title": "Island School Open Day", "event_date": "2026-11-15", "event_time": "14:00", "category": "open_day", "description": "ESF Island School open day for prospective families" },
  { "title": "SSPA Registration", "event_date": "2026-04-15", "event_time": "09:00", "category": "sspa", "description": "Secondary School Places Allocation registration opens" },
  { "title": "SSPA Band Results", "event_date": "2026-05-20", "event_time": "10:00", "category": "sspa", "description": "SSPA banding results released" },
  { "title": "SSPA Allocation Results", "event_date": "2026-07-07", "event_time": "10:00", "category": "sspa", "description": "Final SSPA school allocation results announced" },
  { "title": "School Tour Reminder", "event_date": "2026-04-20", "event_time": "14:00", "category": "custom", "description": "Personal reminder: visit shortlisted schools" }
]
```

- [ ] **Step 2: Add seedCalendarEvents to seed.ts**

Add the following function and import at the end of `hk-school-finder/src/db/seed.ts`, before the batch insert section:

Add this import near the top of the file (after existing imports):

```typescript
import type { CalendarEventInput } from "@/types/calendar";
```

Add this function at the end of the file:

```typescript
export async function seedCalendarEvents(db: SQLiteDatabase): Promise<void> {
  // Check if already seeded
  const existing = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM calendar_events WHERE is_seeded = 1"
  );
  if (existing && existing.count > 0) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const demoEvents = require("../../assets/data/demo-calendar-events.json") as Array<{
    title: string;
    event_date: string;
    event_time?: string;
    category: string;
    description?: string;
  }>;

  const generateId = (): string =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  await db.withTransactionAsync(async () => {
    const sql = `INSERT INTO calendar_events
      (id, title, description, event_date, event_time, category, school_no, reminder_enabled, is_seeded)
      VALUES (?, ?, ?, ?, ?, ?, NULL, 0, 1)`;
    const stmt = await db.prepareAsync(sql);
    try {
      for (const e of demoEvents) {
        await stmt.executeAsync([
          generateId(),
          e.title,
          e.description ?? null,
          e.event_date,
          e.event_time ?? null,
          e.category,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}
```

- [ ] **Step 3: Call seedCalendarEvents from seedDatabase**

In `hk-school-finder/src/db/seed.ts`, inside the `seedDatabase` function, add a call to `seedCalendarEvents` just before the metadata writes (before `const now = new Date().toISOString();`):

```typescript
  // Seed demo calendar events
  await seedCalendarEvents(db);
```

- [ ] **Step 4: Commit**

```bash
git add assets/data/demo-calendar-events.json src/db/seed.ts
git commit -m "feat(calendar): add demo event seed data and seeding logic"
```

---

### Task 12: Implement SettingsScreen

**Files:**
- Modify: `hk-school-finder/app/(tabs)/settings/index.tsx`

Sections: Display (language, appearance), Notifications (toggles), Data (refresh, clear), About (data sources, version).

- [ ] **Step 1: Replace the settings screen**

Replace `hk-school-finder/app/(tabs)/settings/index.tsx`:

```typescript
import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { useTheme, type ThemePreference } from "@/providers/ThemeProvider";
import { useLanguage, type Locale } from "@/providers/LanguageProvider";
import { storage } from "@/stores/mmkv";
import { COLORS } from "@/constants/colors";

const THEME_OPTIONS: { key: ThemePreference; i18nKey: string }[] = [
  { key: "light", i18nKey: "settings_light" },
  { key: "dark", i18nKey: "settings_dark" },
  { key: "system", i18nKey: "settings_system" },
];

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { preference, setPreference } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  const [admissionReminders, setAdmissionReminders] = useState(
    () => storage.getString("pref_admission_reminders") !== "false"
  );
  const [openDayAlerts, setOpenDayAlerts] = useState(
    () => storage.getString("pref_open_day_alerts") !== "false"
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    db.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = ?",
      "last_seed_ts"
    ).then((row) => {
      if (row) setLastUpdated(row.value);
    });
  }, [db]);

  const toggleAdmissionReminders = useCallback((val: boolean) => {
    setAdmissionReminders(val);
    storage.set("pref_admission_reminders", String(val));
  }, []);

  const toggleOpenDayAlerts = useCallback((val: boolean) => {
    setOpenDayAlerts(val);
    storage.set("pref_open_day_alerts", String(val));
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(t("settings_clear_all"), t("settings_clear_confirm"), [
      { text: t("settings_clear_no"), style: "cancel" },
      {
        text: t("settings_clear_yes"),
        style: "destructive",
        onPress: async () => {
          await db.runAsync("DELETE FROM schools");
          await db.runAsync("DELETE FROM hei_institutions");
          await db.runAsync("DELETE FROM ugc_programmes");
          await db.runAsync("DELETE FROM calendar_events");
          await db.runAsync("DELETE FROM db_metadata");
          storage.remove("shortlist-storage");
          storage.remove("status-tracker-storage");
          Alert.alert("Data cleared. Please restart the app.");
        },
      },
    ]);
  }, [db, t]);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const lastUpdatedDisplay = lastUpdated
    ? t("settings_last_updated").replace("{date}", new Date(lastUpdated).toLocaleDateString())
    : "";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Display Section */}
      <Text style={styles.sectionTitle}>{t("settings_display")}</Text>
      <View style={styles.card}>
        {/* Language */}
        <Text style={styles.rowLabel}>{t("settings_language")}</Text>
        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setLocale("en")}
            style={[styles.segment, locale === "en" && styles.segmentActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: locale === "en" }}
          >
            <Text style={[styles.segmentText, locale === "en" && styles.segmentTextActive]}>
              {t("settings_english")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale("tc")}
            style={[styles.segment, locale === "tc" && styles.segmentActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: locale === "tc" }}
          >
            <Text style={[styles.segmentText, locale === "tc" && styles.segmentTextActive]}>
              {t("settings_chinese")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Appearance */}
        <Text style={styles.rowLabel}>{t("settings_appearance")}</Text>
        <View style={styles.segmentRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setPreference(opt.key)}
              style={[styles.segment, preference === opt.key && styles.segmentActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: preference === opt.key }}
            >
              <Text style={[styles.segmentText, preference === opt.key && styles.segmentTextActive]}>
                {t(opt.i18nKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>{t("settings_notifications")}</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>{t("settings_admission_reminders")}</Text>
          <Switch
            value={admissionReminders}
            onValueChange={toggleAdmissionReminders}
            trackColor={{ true: COLORS.accent, false: COLORS.light.hairline }}
            thumbColor={COLORS.light.surface}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>{t("settings_open_day_alerts")}</Text>
          <Switch
            value={openDayAlerts}
            onValueChange={toggleOpenDayAlerts}
            trackColor={{ true: COLORS.accent, false: COLORS.light.hairline }}
            thumbColor={COLORS.light.surface}
          />
        </View>
      </View>

      {/* Data Section */}
      <Text style={styles.sectionTitle}>{t("settings_data")}</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>{t("settings_cached_data")}</Text>
          <Text style={styles.rowValue}>{lastUpdatedDisplay}</Text>
        </View>
        <View style={styles.divider} />
        <Pressable onPress={handleClearAll} style={styles.dangerRow} accessibilityRole="button">
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.dangerText}>{t("settings_clear_all")}</Text>
        </Pressable>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>{t("settings_about")}</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>{t("settings_data_sources")}</Text>
          <Text style={styles.rowValue}>{t("settings_data_attribution")}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>{t("settings_version")}</Text>
          <Text style={styles.rowValue}>{appVersion}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.light.textPrimary,
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.hairline,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.light.textPrimary,
  },
  segmentTextActive: {
    color: COLORS.light.surface,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light.hairline,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#EF4444",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/settings/index.tsx
git commit -m "feat(settings): implement settings screen with language, theme, notifications, and data management"
```

---

### Task 13: End-to-End Verification

- [ ] **Step 1: Run all unit tests**

```bash
cd hk-school-finder
npx jest --no-cache
```

Expected: All tests pass (including existing map and parser tests).

- [ ] **Step 2: Run TypeScript check**

```bash
cd hk-school-finder
npx tsc --noEmit 2>&1 | grep -v "test.ts"
```

Expected: No new type errors.

- [ ] **Step 3: Start development build and verify Shortlist tab**

On emulator:
1. Add 2-3 schools to shortlist from Discover tab
2. Tap **Shortlist** tab -- verify cards with school details appear
3. Tap status stepper stages -- verify amber highlighting updates
4. Tap "Remove" -- verify school removed
5. Remove all -- verify empty state shown

- [ ] **Step 4: Verify Calendar tab**

1. Tap **Calendar** tab -- verify month grid shows
2. Navigate between months using arrows
3. Verify demo events appear (seeded on first launch)
4. Tap a day with events -- verify events list filters
5. Tap FAB "+" -- verify create event form opens
6. Create a new event -- verify it appears in the list
7. Tap an event -- verify detail screen shows
8. Edit the event -- verify changes persist
9. Delete the event -- verify it's removed
10. Tap bell icon on event card -- verify reminder toggles
11. Tap calendar icon on event card -- verify system calendar export (permissions prompt)

- [ ] **Step 5: Verify Settings tab**

1. Tap **Settings** tab
2. Switch language to Traditional Chinese -- verify all text updates
3. Switch back to English
4. Toggle appearance (Light/Dark/System) -- verify theme changes
5. Toggle notification switches
6. Verify "Cached Data" shows last updated date
7. Verify app version shows

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
cd hk-school-finder
git add -A
git commit -m "fix(p6): address issues found during e2e verification"
```
