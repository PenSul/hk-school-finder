export type EducationLevel = "KG" | "PRIMARY" | "SECONDARY" | "UNIVERSITY";

export interface K12FilterState {
  educationLevel: EducationLevel;
  searchQuery: string;
  districts: string[];
  financeTypes: string[];
  religions: string[];
  sessions: string[];
  genders: string[];
}

export interface UniFilterState {
  scope: "UGC" | "ALL";
  studyLevels: string[];
  modesOfStudy: string[];
  programmeSearch: string;
  districts: string[];
}
