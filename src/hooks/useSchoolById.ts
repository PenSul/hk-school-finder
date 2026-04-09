import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { School } from "@/types/school";
import { getSchoolById } from "@/repositories/schoolRepository";

export function useSchoolById(schoolNo: string) {
  const db = useSQLiteContext();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSchoolById(db, schoolNo)
      .then((result) => {
        if (!cancelled) {
          setSchool(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [db, schoolNo]);

  return { school, loading };
}
