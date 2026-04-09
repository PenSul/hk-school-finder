import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Switch } from "react-native";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { COLORS } from "@/constants/colors";
import type { EventCategory, CalendarEventInput } from "@/types/calendar";

const CATEGORIES: EventCategory[] = ["poa", "kg", "open_day", "sspa", "custom"];

interface EventFormProps {
  initialValues?: Partial<CalendarEventInput>;
  onSubmit: (input: CalendarEventInput) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function EventForm({ initialValues, onSubmit, onCancel, submitLabel }: EventFormProps) {
  const { locale, t } = useLanguage();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [eventDate, setEventDate] = useState(initialValues?.event_date ?? "");
  const [eventTime, setEventTime] = useState(initialValues?.event_time ?? "");
  const [category, setCategory] = useState<EventCategory>(initialValues?.category ?? "custom");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(initialValues?.reminder_enabled ?? false);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !eventDate.trim()) return;
    onSubmit({
      title: title.trim(),
      event_date: eventDate.trim(),
      event_time: eventTime.trim() || undefined,
      category,
      description: description.trim() || undefined,
      reminder_enabled: reminderEnabled,
    });
  }, [title, eventDate, eventTime, category, description, reminderEnabled, onSubmit]);

  const isValid = title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(eventDate.trim());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.label}>{t("calendar_title")}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder={t("calendar_title")}
        placeholderTextColor={COLORS.light.textSecondary}
        accessibilityLabel={t("calendar_title")}
      />

      {/* Date */}
      <Text style={styles.label}>{t("calendar_date")}</Text>
      <TextInput
        value={eventDate}
        onChangeText={setEventDate}
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={COLORS.light.textSecondary}
        keyboardType="numbers-and-punctuation"
        accessibilityLabel={t("calendar_date")}
      />

      {/* Time */}
      <Text style={styles.label}>{t("calendar_time")}</Text>
      <TextInput
        value={eventTime}
        onChangeText={setEventTime}
        style={styles.input}
        placeholder="HH:MM"
        placeholderTextColor={COLORS.light.textSecondary}
        keyboardType="numbers-and-punctuation"
        accessibilityLabel={t("calendar_time")}
      />

      {/* Category */}
      <Text style={styles.label}>{t("calendar_category")}</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const config = EVENT_CATEGORIES[cat];
          const label = locale === "tc" ? config.labelTc : config.labelEn;
          const isActive = category === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                { borderColor: config.color },
                isActive && { backgroundColor: config.color },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.categoryText, isActive && { color: COLORS.light.surface }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Description */}
      <Text style={styles.label}>{t("calendar_description")}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        placeholder={t("calendar_description")}
        placeholderTextColor={COLORS.light.textSecondary}
        multiline
        numberOfLines={3}
        accessibilityLabel={t("calendar_description")}
      />

      {/* Reminder */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t("calendar_reminder")}</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ true: COLORS.accent, false: COLORS.light.hairline }}
          thumbColor={COLORS.light.surface}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable onPress={onCancel} style={styles.cancelBtn} accessibilityRole="button">
          <Text style={styles.cancelText}>{t("calendar_cancel")}</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          style={[styles.submitBtn, !isValid && styles.submitDisabled]}
          disabled={!isValid}
          accessibilityRole="button"
        >
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.light.surface,
    borderWidth: 1,
    borderColor: COLORS.light.hairline,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.light.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.light.textPrimary,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.light.textPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.light.hairline,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.textSecondary,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.surface,
  },
});
