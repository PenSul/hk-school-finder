import { View, TextInput, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFilterStore } from "@/stores/useFilterStore";

interface SearchBarProps {
  onFilterPress: () => void;
  hasActiveFilters: boolean;
}

export function SearchBar({ onFilterPress, hasActiveFilters }: SearchBarProps) {
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  return (
    <View className="flex-row items-center mx-4 mb-2 gap-2">
      <View className="flex-1 flex-row items-center bg-surface-light rounded-xl px-3 py-2 border border-hairline">
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search schools..."
          placeholderTextColor="#64748B"
          className="flex-1 ml-2 text-base text-text-primary"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search schools"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={8}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={onFilterPress}
        className="relative w-11 h-11 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={`Open filters${hasActiveFilters ? ", filters active" : ""}`}
      >
        <Ionicons name="options-outline" size={24} color="#1E3A5F" />
        {hasActiveFilters && (
          <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent" />
        )}
      </Pressable>
    </View>
  );
}
