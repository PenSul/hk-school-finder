import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useCompareStore } from "@/stores/useCompareStore";

export default function CompareScreen() {
  const count = useCompareStore((s) => s.selectedIds.length);

  return (
    <>
      <Stack.Screen options={{ title: "Compare Schools" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          Compare Schools
        </Text>
        <Text className="text-base text-text-secondary">
          {count} schools selected
        </Text>
      </View>
    </>
  );
}
