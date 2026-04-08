import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function InstitutionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Institution Detail" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary mb-2">
          Institution Detail
        </Text>
        <Text className="text-base text-text-secondary">ID: {id}</Text>
      </View>
    </>
  );
}
