import { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent } from "@/types/calendar";

interface EventCardProps {
  event: CalendarEvent;
  onToggleReminder: (eventId: string, enabled: boolean) => void;
  onExportCalendar: (event: CalendarEvent) => void;
}

export const EventCard = memo(function EventCard({
  event,
  onToggleReminder,
  onExportCalendar,
}: EventCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const categoryConfig = EVENT_CATEGORIES[event.category];
  const categoryLabel = locale === "tc" ? categoryConfig.labelTc : categoryConfig.labelEn;

  const handlePress = useCallback(() => {
    router.push(`/event/${event.id}`);
  }, [router, event.id]);

  const handleToggleReminder = useCallback(() => {
    onToggleReminder(event.id, !event.reminder_enabled);
  }, [event.id, event.reminder_enabled, onToggleReminder]);

  const handleExport = useCallback(() => {
    onExportCalendar(event);
  }, [event, onExportCalendar]);

  const timeDisplay = event.event_time
    ? event.event_time
    : "";

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, { borderLeftColor: categoryConfig.color }]}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.event_date}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <View style={[styles.badge, { backgroundColor: categoryConfig.color }]}>
            <Text style={styles.badgeText}>{categoryLabel}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {event.event_date}{timeDisplay ? ` ${timeDisplay}` : ""}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={handleToggleReminder}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Toggle reminder"
        >
          <Ionicons
            name={event.reminder_enabled ? "notifications" : "notifications-outline"}
            size={18}
            color={event.reminder_enabled ? COLORS.accent : COLORS.light.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={handleExport}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Add to calendar"
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.light.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.surface,
    borderLeftWidth: 4,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.textPrimary,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
  date: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
