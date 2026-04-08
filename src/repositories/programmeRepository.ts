import type { SQLiteDatabase } from "expo-sqlite";
import type { UgcProgramme } from "@/types/school";
import type { UniFilterState } from "@/types/filter";

function buildWhereClause(filters: UniFilterState): {
  where: string;
  params: (string | number)[];
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.programmeSearch.trim()) {
    conditions.push(
      "(programme_name_en LIKE ? OR programme_name_tc LIKE ?)"
    );
    const q = `%${filters.programmeSearch.trim()}%`;
    params.push(q, q);
  }

  if (filters.studyLevels.length > 0) {
    const placeholders = filters.studyLevels.map(() => "?").join(",");
    conditions.push(`level_of_study_en IN (${placeholders})`);
    params.push(...filters.studyLevels);
  }

  if (filters.modesOfStudy.length > 0) {
    const placeholders = filters.modesOfStudy.map(() => "?").join(",");
    conditions.push(`mode_of_study_en IN (${placeholders})`);
    params.push(...filters.modesOfStudy);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
}

export async function getProgrammes(
  db: SQLiteDatabase,
  filters: UniFilterState,
  limit = 50,
  offset = 0
): Promise<UgcProgramme[]> {
  const { where, params } = buildWhereClause(filters);
  return db.getAllAsync<UgcProgramme>(
    `SELECT * FROM ugc_programmes ${where} ORDER BY university_en, programme_name_en LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

export async function getProgrammesByUniversity(
  db: SQLiteDatabase,
  universityEn: string,
  searchQuery = "",
  studyLevel = "",
  modeOfStudy = ""
): Promise<UgcProgramme[]> {
  const conditions: string[] = ["university_en = ?"];
  const params: (string | number)[] = [universityEn];

  if (searchQuery.trim()) {
    conditions.push(
      "(programme_name_en LIKE ? OR programme_name_tc LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q);
  }

  if (studyLevel) {
    conditions.push("level_of_study_en = ?");
    params.push(studyLevel);
  }

  if (modeOfStudy) {
    conditions.push("mode_of_study_en = ?");
    params.push(modeOfStudy);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  return db.getAllAsync<UgcProgramme>(
    `SELECT * FROM ugc_programmes ${where} ORDER BY programme_name_en`,
    params
  );
}

export async function getProgrammeCount(
  db: SQLiteDatabase,
  filters: UniFilterState
): Promise<number> {
  const { where, params } = buildWhereClause(filters);
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ugc_programmes ${where}`,
    params
  );
  return row?.count ?? 0;
}

export async function getProgrammeCountByUniversity(
  db: SQLiteDatabase,
  universityEn: string
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM ugc_programmes WHERE university_en = ?",
    universityEn
  );
  return row?.count ?? 0;
}

export async function getDistinctUniversities(
  db: SQLiteDatabase
): Promise<{ university_en: string; university_tc: string; latitude: number; longitude: number }[]> {
  return db.getAllAsync(
    "SELECT DISTINCT university_en, university_tc, latitude, longitude FROM ugc_programmes ORDER BY university_en"
  );
}
