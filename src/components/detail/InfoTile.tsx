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
