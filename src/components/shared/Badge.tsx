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
    <View style={{ backgroundColor: config.color }} className="rounded px-2 py-0.5">
      <Text className="text-xs font-medium text-white">{label}</Text>
    </View>
  );
}
