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
        <Ionicons name="school-outline" size={12} color={COLORS.light.surface} />
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
