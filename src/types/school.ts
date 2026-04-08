/** K-12 school record stored in SQLite */
export interface School {
  school_no: string;
  name_en: string;
  name_tc: string;
  category_en: string;
  category_tc: string;
  address_en: string;
  address_tc: string;
  school_level_en: string;
  school_level_tc: string;
  district_en: string;
  district_tc: string;
  finance_type_en: string;
  finance_type_tc: string;
  religion_en: string;
  religion_tc: string;
  session_en: string;
  session_tc: string;
  students_gender_en: string;
  students_gender_tc: string;
  telephone: string;
  fax: string;
  website: string;
  latitude: number;
  longitude: number;
}

/** Higher Education Institution record */
export interface HeiInstitution {
  objectid: number;
  facility_name_en: string;
  facility_name_tc: string;
  address_en: string;
  address_tc: string;
  telephone: string;
  fax: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
}

/** UGC-funded programme record */
export interface UgcProgramme {
  objectid: number;
  university_en: string;
  university_tc: string;
  programme_name_en: string;
  programme_name_tc: string;
  level_of_study_en: string;
  level_of_study_tc: string;
  mode_of_study_en: string;
  mode_of_study_tc: string;
  latitude: number;
  longitude: number;
}

/**
 * Raw school record from EDB API JSON.
 * Keys match the API response exactly.
 */
export interface RawSchool {
  "SCHOOL NO.": number;
  "ENGLISH NAME": string;
  "中文名稱": string;
  "ENGLISH CATEGORY": string;
  "中文類別": string;
  "ENGLISH ADDRESS": string;
  "中文地址": string;
  "SCHOOL LEVEL": string;
  "學校類型": string;
  "DISTRICT": string;
  "分區": string;
  "FINANCE TYPE": string;
  "資助種類": string;
  "RELIGION": string;
  "宗教": string;
  "SESSION": string;
  "學校授課時間": string;
  "STUDENTS GENDER": string;
  "就讀學生性別": string;
  "TELEPHONE": string;
  "聯絡電話": string;
  "FAX NUMBER": string;
  "傳真號碼": string;
  "WEBSITE": string;
  "網頁": string;
  "LONGITUDE": number;
  "LATITUDE": number;
}

/** Raw HEI feature properties from ASFPS GeoJSON API */
export interface RawHeiProperties {
  OBJECTID: number;
  Facility_Name: string;
  "設施名稱": string;
  Address: string;
  "地址": string;
  Telephone: string | null;
  "聯絡電話": string | null;
  Fax_Number: string | null;
  "傳真號碼": string | null;
  Email_Address: string | null;
  "電郵地址": string | null;
  Website: string | null;
  "網頁": string | null;
  "Latitude___緯度": number;
  "Longitude___經度": number;
}

export interface RawHeiFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RawHeiProperties;
}

/** Raw UGC programme feature properties from GeoJSON API */
export interface RawUgcProperties {
  OBJECTID: number;
  University_EN: string;
  University_TC: string;
  Programme_Name_EN: string;
  Programme_Name_TC: string;
  Level_of_Study_EN: string;
  Level_of_Study_TC: string;
  Mode_of_Study_EN: string;
  Mode_of_Study_TC: string;
  Latitude: number;
  Longitude: number;
}

export interface RawUgcFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: RawUgcProperties;
}

export interface GeoJsonCollection<F> {
  type: "FeatureCollection";
  features: F[];
}
