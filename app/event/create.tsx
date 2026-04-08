import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function CreateEventScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Event" }} />
      <View className="flex-1 items-center justify-center bg-bg-light">
        <Text className="text-2xl font-bold text-primary">New Event</Text>
        <Text className="text-base text-text-secondary mt-2">Coming soon</Text>
      </View>
    </>
  );
}
