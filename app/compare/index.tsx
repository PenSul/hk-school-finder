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
