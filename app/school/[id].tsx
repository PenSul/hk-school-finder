import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
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
              <Text className="text-sm text-white/70 mt-1" numberOfLines={2}>
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
                    <Text className="text-sm text-text-primary">{addressEn}</Text>
                  ) : null}
                  {addressTc ? (
                    <Text className="text-sm text-text-primary">{addressTc}</Text>
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
