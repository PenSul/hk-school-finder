import type { SQLiteDatabase } from "expo-sqlite";

const CREATE_SCHOOLS = `
CREATE TABLE IF NOT EXISTS schools (
  school_no TEXT NOT NULL PRIMARY KEY,
  name_en TEXT,
  name_tc TEXT,
  category_en TEXT,
  category_tc TEXT,
  address_en TEXT,
  address_tc TEXT,
  school_level_en TEXT,
  school_level_tc TEXT,
  district_en TEXT,
  district_tc TEXT,
  finance_type_en TEXT,
  finance_type_tc TEXT,
  religion_en TEXT,
  religion_tc TEXT,
  session_en TEXT,
  session_tc TEXT,
  students_gender_en TEXT,
  students_gender_tc TEXT,
  telephone TEXT,
  fax TEXT,
  website TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_HEI = `
CREATE TABLE IF NOT EXISTS hei_institutions (
  objectid INTEGER NOT NULL PRIMARY KEY,
  facility_name_en TEXT,
  facility_name_tc TEXT,
  address_en TEXT,
  address_tc TEXT,
  telephone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_UGC = `
CREATE TABLE IF NOT EXISTS ugc_programmes (
  objectid INTEGER NOT NULL PRIMARY KEY,
  university_en TEXT,
  university_tc TEXT,
  programme_name_en TEXT,
  programme_name_tc TEXT,
  level_of_study_en TEXT,
  level_of_study_tc TEXT,
  mode_of_study_en TEXT,
  mode_of_study_tc TEXT,
  latitude REAL,
  longitude REAL
);`;

const CREATE_CALENDAR = `
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_time TEXT,
  category TEXT NOT NULL,
  school_no TEXT,
  reminder_enabled INTEGER DEFAULT 0,
  is_seeded INTEGER DEFAULT 0
);`;

const CREATE_METADATA = `
CREATE TABLE IF NOT EXISTS db_metadata (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL
);`;

const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_schools_level ON schools(school_level_en);
CREATE INDEX IF NOT EXISTS idx_schools_district ON schools(district_en);
CREATE INDEX IF NOT EXISTS idx_schools_finance ON schools(finance_type_en);
CREATE INDEX IF NOT EXISTS idx_schools_religion ON schools(religion_en);
CREATE INDEX IF NOT EXISTS idx_schools_session ON schools(session_en);
CREATE INDEX IF NOT EXISTS idx_schools_gender ON schools(students_gender_en);
CREATE INDEX IF NOT EXISTS idx_hei_name ON hei_institutions(facility_name_en);
CREATE INDEX IF NOT EXISTS idx_ugc_university ON ugc_programmes(university_en);
CREATE INDEX IF NOT EXISTS idx_ugc_programme ON ugc_programmes(programme_name_en);
CREATE INDEX IF NOT EXISTS idx_ugc_level ON ugc_programmes(level_of_study_en);
CREATE INDEX IF NOT EXISTS idx_ugc_mode ON ugc_programmes(mode_of_study_en);
CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON calendar_events(category);
`;

/** Creates all tables and indexes. Safe to call multiple times (IF NOT EXISTS). */
export async function createTables(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_SCHOOLS}
    ${CREATE_HEI}
    ${CREATE_UGC}
    ${CREATE_CALENDAR}
    ${CREATE_METADATA}
    ${CREATE_INDEXES}
  `);
}
