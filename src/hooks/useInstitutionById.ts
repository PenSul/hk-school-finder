import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { HeiInstitution } from "@/types/school";
import { getInstitutionById } from "@/repositories/heiRepository";

export function useInstitutionById(objectid: number) {
  const db = useSQLiteContext();
  const [institution, setInstitution] = useState<HeiInstitution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInstitutionById(db, objectid)
      .then((result) => {
        if (!cancelled) {
          setInstitution(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [db, objectid]);

  return { institution, loading };
}
