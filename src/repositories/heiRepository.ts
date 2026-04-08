import type { SQLiteDatabase } from "expo-sqlite";
import type { HeiInstitution } from "@/types/school";

export async function getInstitutions(
  db: SQLiteDatabase,
  searchQuery = "",
  limit = 50,
  offset = 0
): Promise<HeiInstitution[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (searchQuery.trim()) {
    conditions.push(
      "(facility_name_en LIKE ? OR facility_name_tc LIKE ? OR address_en LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q, q);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db.getAllAsync<HeiInstitution>(
    `SELECT * FROM hei_institutions ${where} ORDER BY facility_name_en LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

export async function getInstitutionById(
  db: SQLiteDatabase,
  objectid: number
): Promise<HeiInstitution | null> {
  return db.getFirstAsync<HeiInstitution>(
    "SELECT * FROM hei_institutions WHERE objectid = ?",
    objectid
  );
}

export async function getInstitutionCount(
  db: SQLiteDatabase,
  searchQuery = ""
): Promise<number> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (searchQuery.trim()) {
    conditions.push(
      "(facility_name_en LIKE ? OR facility_name_tc LIKE ? OR address_en LIKE ?)"
    );
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q, q);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM hei_institutions ${where}`,
    params
  );
  return row?.count ?? 0;
}

export async function getInstitutionsForMap(
  db: SQLiteDatabase
): Promise<HeiInstitution[]> {
  return db.getAllAsync<HeiInstitution>(
    "SELECT * FROM hei_institutions WHERE latitude != 0 AND longitude != 0"
  );
}
