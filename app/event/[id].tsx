import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getEventById, updateEvent, deleteEvent } from "@/repositories/calendarRepository";
import { EventForm } from "@/components/calendar/EventForm";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent, CalendarEventInput } from "@/types/calendar";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(db, id).then((e) => {
      setEvent(e);
      setLoading(false);
    });
  }, [db, id]);

  const handleUpdate = useCallback(
    async (input: CalendarEventInput) => {
      if (!id) return;
      await updateEvent(db, id, input);
      const updated = await getEventById(db, id);
      setEvent(updated);
      setEditing(false);
    },
    [db, id]
  );

  const handleDelete = useCallback(() => {
    Alert.alert(t("calendar_delete"), t("calendar_delete_confirm"), [
      { text: t("calendar_delete_no"), style: "cancel" },
      {
        text: t("calendar_delete_yes"),
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          await deleteEvent(db, id);
          router.back();
        },
      },
    ]);
  }, [db, id, router, t]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <View style={styles.center}>
          <Text style={styles.notFound}>{t("no_results")}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.goBack}>{t("detail_go_back")}</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (editing) {
    return (
      <>
        <Stack.Screen options={{ title: t("calendar_edit") }} />
        <View style={{ flex: 1, backgroundColor: COLORS.light.background }}>
          <EventForm
            initialValues={{
              title: event.title,
              event_date: event.event_date,
              event_time: event.event_time ?? undefined,
              category: event.category,
              description: event.description ?? undefined,
              reminder_enabled: event.reminder_enabled,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel={t("calendar_save")}
          />
        </View>
      </>
    );
  }

  const categoryConfig = EVENT_CATEGORIES[event.category];
  const categoryLabel = locale === "tc" ? categoryConfig.labelTc : categoryConfig.labelEn;

  return (
    <>
      <Stack.Screen
        options={{
          title: t("screen_event_detail"),
          headerRight: () => (
            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={COLORS.light.surface} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Category stripe */}
        <View style={[styles.categoryStripe, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.categoryLabel}>{categoryLabel}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.light.textSecondary} />
            <Text style={styles.infoText}>{event.event_date}</Text>
          </View>
          {event.event_time ? (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.light.textSecondary} />
              <Text style={styles.infoText}>{event.event_time}</Text>
            </View>
          ) : null}
          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons
              name={event.reminder_enabled ? "notifications" : "notifications-outline"}
              size={16}
              color={event.reminder_enabled ? COLORS.accent : COLORS.light.textSecondary}
            />
            <Text style={styles.infoText}>
              {t("calendar_reminder")}: {event.reminder_enabled ? "On" : "Off"}
            </Text>
          </View>
        </View>

        {/* Delete button */}
        <Pressable
          onPress={handleDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={t("calendar_delete")}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteText}>{t("calendar_delete")}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.light.background,
  },
  notFound: {
    fontSize: 16,
    color: COLORS.light.textSecondary,
    marginBottom: 12,
  },
  goBack: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  categoryStripe: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.light.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.light.textSecondary,
  },
  description: {
    fontSize: 15,
    color: COLORS.light.textPrimary,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 22,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 10,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
