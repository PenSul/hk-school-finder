export type EventCategory = "poa" | "kg" | "open_day" | "sspa" | "custom";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  category: EventCategory;
  school_no: string | null;
  reminder_enabled: boolean;
  is_seeded: boolean;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  category: EventCategory;
  school_no?: string;
  reminder_enabled?: boolean;
}
