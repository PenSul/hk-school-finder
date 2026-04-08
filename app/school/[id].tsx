import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "School Detail" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          School Detail
        </Text>
        <Text className="text-base text-text-secondary">ID: {id}</Text>
      </View>
    </>
  );
}
