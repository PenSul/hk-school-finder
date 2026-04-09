import { useState, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import type { MapPressEvent, Region } from "react-native-maps";
import type BottomSheet from "@gorhom/bottom-sheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
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

const MAP_TYPE_I18N: Record<MapType, string> = {
  standard: "map_layer_standard",
  satellite: "map_layer_satellite",
  terrain: "map_layer_terrain",
};

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
  const previewSheetRef = useRef<BottomSheetModal>(null);

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
    previewSheetRef.current?.present();
  }, []);

  const handleMapMarkerPress = useCallback(
    (e: { nativeEvent: { id?: string } }) => {
      const markerId = e.nativeEvent.id;
      if (!markerId) return;
      const pin = pins.find((p) => p.id === markerId);
      if (pin) onMarkerPress(pin);
    },
    [pins, onMarkerPress]
  );

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
    try {
      const Location = await import("expo-location");
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
    } catch {
      Alert.alert(t("map_location_denied"));
    }
  }, [t]);

  const onMapPress = useCallback((_e: MapPressEvent) => {
    previewSheetRef.current?.dismiss();
    setSelectedPin(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={HK_REGION}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={onMapPress}
        onMarkerPress={handleMapMarkerPress}
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
            accessibilityLabel={pin.nameEn}
          >
            <SchoolPin financeType={pin.financeType} />
          </Marker>
        ))}
      </MapView>

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
        accessibilityLabel={t(MAP_TYPE_I18N[mapType])}
      >
        <Ionicons name="layers-outline" size={22} color={COLORS.primary} />
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
    backgroundColor: COLORS.light.surface,
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
