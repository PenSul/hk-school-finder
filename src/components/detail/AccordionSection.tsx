import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AccordionSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionSection = memo(function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
}: AccordionSectionProps) {
  const reduceMotion = useReducedMotion();
  const progress = useDerivedValue(() => {
    const target = expanded ? 1 : 0;
    return reduceMotion ? target : withTiming(target, { duration: 250 });
  }, [expanded, reduceMotion]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 500,
    overflow: "hidden" as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <View className="bg-surface-light rounded-xl mx-4 mb-3 overflow-hidden">
      <Pressable
        onPress={onToggle}
        className="flex-row justify-between items-center px-4 py-3"
        style={{ minHeight: 48 }}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${expanded ? "collapse" : "expand"}`}
        accessibilityState={{ expanded }}
      >
        <Text className="text-base font-semibold text-text-primary flex-1">
          {title}
        </Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </Animated.View>
      </Pressable>
      <Animated.View style={bodyStyle}>
        <View className="px-4 pb-4">{children}</View>
      </Animated.View>
    </View>
  );
});
