import { memo, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import type { CalendarEvent } from "@/types/calendar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  events: CalendarEvent[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const CalendarGrid = memo(function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onSelectDay,
}: CalendarGridProps) {
  const cells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const eventDays = useMemo(() => {
    const days = new Set<number>();
    for (const e of events) {
      const day = parseInt(e.event_date.split("-")[2], 10);
      if (!isNaN(day)) days.add(day);
    }
    return days;
  }, [events]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  return (
    <View style={styles.container}>
      {/* Day-of-week header */}
      <View style={styles.row}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <Text style={styles.headerText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            const key = `${rowIdx}-${colIdx}`;
            if (day === null) {
              return <View key={key} style={styles.cell} />;
            }
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const hasEvents = eventDays.has(day);
            return (
              <Pressable
                key={key}
                style={[
                  styles.cell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => onSelectDay(day)}
                accessibilityRole="button"
                accessibilityLabel={`${year}-${month}-${day}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {day}
                </Text>
                {hasEvents && (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.light.textSecondary,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 44,
  },
  todayCell: {
    backgroundColor: "rgba(30, 58, 95, 0.1)",
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.light.textPrimary,
  },
  todayText: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  selectedText: {
    fontWeight: "700",
    color: COLORS.light.surface,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: COLORS.light.surface,
  },
});
