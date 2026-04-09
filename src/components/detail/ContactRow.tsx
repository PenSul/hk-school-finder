import { memo } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLanguage } from "@/providers/LanguageProvider";

interface ContactRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
  type?: "tel" | "fax" | "email" | "url";
}

function handlePress(value: string, type: string) {
  switch (type) {
    case "tel":
      Linking.openURL(`tel:${value}`);
      break;
    case "email":
      Linking.openURL(`mailto:${value}`);
      break;
    case "url": {
      const url = value.startsWith("http") ? value : `https://${value}`;
      Linking.openURL(url);
      break;
    }
  }
}

export const ContactRow = memo(function ContactRow({
  icon,
  label,
  value,
  type,
}: ContactRowProps) {
  const { t } = useLanguage();
  const hasValue = value !== null && value.trim() !== "";
  const isActionable = hasValue && type && type !== "fax";

  const content = (
    <View
      className="flex-row items-center py-3 border-b border-hairline-light"
      style={{ minHeight: 48 }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={hasValue ? "#1E3A5F" : "#94A3B8"}
        style={{ width: 28 }}
      />
      <Text className="text-sm text-text-secondary w-20">{label}</Text>
      <Text
        className={`flex-1 text-sm ${hasValue ? "text-text-primary" : "text-text-secondary italic"}`}
        numberOfLines={2}
      >
        {hasValue ? value : t("detail_not_available")}
      </Text>
      {isActionable && (
        <Ionicons name="open-outline" size={16} color="#64748B" />
      )}
    </View>
  );

  if (isActionable) {
    return (
      <Pressable
        onPress={() => handlePress(value!, type!)}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Opens ${type === "tel" ? "phone dialer" : type === "email" ? "email client" : "browser"}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
});
