import { Pressable, Text } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function FilterChip({ label, isActive, onPress, disabled = false }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 mr-2 mb-2 min-h-[36px] items-center justify-center ${
        disabled
          ? "bg-hairline opacity-50"
          : isActive
            ? "bg-primary"
            : "bg-surface-light border border-hairline"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled }}
      accessibilityLabel={`${label} filter${isActive ? ", active" : ""}`}
    >
      <Text
        className={`text-sm ${
          disabled
            ? "text-text-secondary"
            : isActive
              ? "text-white font-medium"
              : "text-text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
