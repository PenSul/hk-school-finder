import type { SQLiteDatabase } from "expo-sqlite";
import type {
  School,
  HeiInstitution,
  UgcProgramme,
  RawSchool,
  RawHeiFeature,
  RawUgcFeature,
  GeoJsonCollection,
} from "@/types/school";
import {
  parseSchool,
  parseHeiInstitution,
  parseUgcProgramme,
} from "./parsers";

const SCHOOLS_API_URL =
  "http://www.edb.gov.hk/attachment/en/student-parents/sch-info/sch-search/sch-location-info/SCH_LOC_EDB.json";
const HEI_API_URL =
  "https://portal.csdi.gov.hk/server/services/common/edb_rcd_1629267205213_58940/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=ASFPS&outputFormat=geojson";
const UGC_API_URL =
  "https://portal.csdi.gov.hk/server/services/common/ugc_rcd_1665536012918_39544/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=geotagging&outputFormat=geojson";

export interface SeedProgress {
  phase: "schools" | "hei" | "ugc" | "done";
  message: string;
}

/** Check if the database has already been seeded. */
export async function isSeeded(db: SQLiteDatabase): Promise<boolean> {
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = ?",
      "last_seed_ts"
    );
    return row != null;
  } catch {
    return false;
  }
}

/**
 * Seed all three datasets into the database.
 * Schools are fetched from the live EDB API (requires connectivity).
 * HEI and UGC fall back to bundled assets on fetch failure.
 */
export async function seedDatabase(
  db: SQLiteDatabase,
  onProgress?: (progress: SeedProgress) => void
): Promise<void> {
  onProgress?.({ phase: "schools", message: "Fetching school data..." });
  const schools = await fetchAndParseSchools();

  onProgress?.({ phase: "hei", message: "Fetching institution data..." });
  const institutions = await fetchAndParseHei();

  onProgress?.({ phase: "ugc", message: "Fetching programme data..." });
  const programmes = await fetchAndParseUgc();

  onProgress?.({ phase: "schools", message: "Saving school data..." });
  await insertSchools(db, schools);

  onProgress?.({ phase: "hei", message: "Saving institution data..." });
  await insertInstitutions(db, institutions);

  onProgress?.({ phase: "ugc", message: "Saving programme data..." });
  await insertProgrammes(db, programmes);

  // Write seed metadata
  const now = new Date().toISOString();
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "last_seed_ts",
    now
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "schools_count",
    String(schools.length)
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "hei_count",
    String(institutions.length)
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
    "ugc_count",
    String(programmes.length)
  );

  onProgress?.({ phase: "done", message: "Data loaded successfully" });
}

// --- Fetch & Parse ---

async function fetchAndParseSchools(): Promise<School[]> {
  const response = await fetch(SCHOOLS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch schools: HTTP ${response.status}`);
  }
  const raw: RawSchool[] = await response.json();
  return raw.map(parseSchool);
}

async function fetchAndParseHei(): Promise<HeiInstitution[]> {
  try {
    const response = await fetch(HEI_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson: GeoJsonCollection<RawHeiFeature> = await response.json();
    return geojson.features.map(parseHeiInstitution);
  } catch {
    return loadBundledHei();
  }
}

async function fetchAndParseUgc(): Promise<UgcProgramme[]> {
  try {
    const response = await fetch(UGC_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson: GeoJsonCollection<RawUgcFeature> = await response.json();
    return geojson.features.map(parseUgcProgramme);
  } catch {
    return loadBundledUgc();
  }
}

// --- Bundled Asset Fallbacks ---

function loadBundledHei(): HeiInstitution[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const geojson = require("../../assets/data/Higher-Education-Institutions.json") as GeoJsonCollection<RawHeiFeature>;
  return geojson.features.map(parseHeiInstitution);
}

function loadBundledUgc(): UgcProgramme[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const geojson = require("../../assets/data/List-of-UGC-funded-Programmes.json") as GeoJsonCollection<RawUgcFeature>;
  return geojson.features.map(parseUgcProgramme);
}

// --- Batch Insert ---

async function insertSchools(
  db: SQLiteDatabase,
  schools: School[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO schools (
    school_no, name_en, name_tc, category_en, category_tc,
    address_en, address_tc, school_level_en, school_level_tc,
    district_en, district_tc, finance_type_en, finance_type_tc,
    religion_en, religion_tc, session_en, session_tc,
    students_gender_en, students_gender_tc,
    telephone, fax, website, latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const s of schools) {
        await stmt.executeAsync([
          s.school_no, s.name_en, s.name_tc, s.category_en, s.category_tc,
          s.address_en, s.address_tc, s.school_level_en, s.school_level_tc,
          s.district_en, s.district_tc, s.finance_type_en, s.finance_type_tc,
          s.religion_en, s.religion_tc, s.session_en, s.session_tc,
          s.students_gender_en, s.students_gender_tc,
          s.telephone, s.fax, s.website, s.latitude, s.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

async function insertInstitutions(
  db: SQLiteDatabase,
  institutions: HeiInstitution[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO hei_institutions (
    objectid, facility_name_en, facility_name_tc,
    address_en, address_tc, telephone, fax, email, website,
    latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const i of institutions) {
        await stmt.executeAsync([
          i.objectid, i.facility_name_en, i.facility_name_tc,
          i.address_en, i.address_tc, i.telephone, i.fax, i.email, i.website,
          i.latitude, i.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

async function insertProgrammes(
  db: SQLiteDatabase,
  programmes: UgcProgramme[]
): Promise<void> {
  const sql = `INSERT OR REPLACE INTO ugc_programmes (
    objectid, university_en, university_tc,
    programme_name_en, programme_name_tc,
    level_of_study_en, level_of_study_tc,
    mode_of_study_en, mode_of_study_tc,
    latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(sql);
    try {
      for (const p of programmes) {
        await stmt.executeAsync([
          p.objectid, p.university_en, p.university_tc,
          p.programme_name_en, p.programme_name_tc,
          p.level_of_study_en, p.level_of_study_tc,
          p.mode_of_study_en, p.mode_of_study_tc,
          p.latitude, p.longitude,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}
