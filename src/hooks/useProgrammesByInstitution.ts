import { useEffect, useState, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { UgcProgramme } from "@/types/school";
import { getProgrammesByUniversity } from "@/repositories/programmeRepository";

const DEBOUNCE_MS = 300;

export function useProgrammesByInstitution(
  universityEn: string,
  searchQuery = ""
) {
  const db = useSQLiteContext();
  const [programmes, setProgrammes] = useState<UgcProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!universityEn) {
      setProgrammes([]);
      setLoading(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setLoading(true);
    timerRef.current = setTimeout(() => {
      getProgrammesByUniversity(db, universityEn, searchQuery)
        .then((result) => {
          setProgrammes(result);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, searchQuery ? DEBOUNCE_MS : 0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [db, universityEn, searchQuery]);

  return { programmes, loading };
}
