import { forwardRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, Linking, Platform, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Badge } from "@/components/shared/Badge";
import { useShortlistStore } from "@/stores/useShortlistStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
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
        handleIndicatorStyle={{ backgroundColor: COLORS.light.textSecondary }}
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
                color={isShortlisted ? COLORS.accent : COLORS.light.textSecondary}
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
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
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
    color: COLORS.light.textPrimary,
  },
  subName: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  address: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    marginTop: 8,
  },
  ctaRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  viewProfileBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
  directionsBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
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
    color: COLORS.primary,
  },
});
