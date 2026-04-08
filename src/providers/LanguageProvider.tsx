import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getLocales } from "expo-localization";
import { storage } from "@/stores/mmkv";
import en from "@/i18n/en.json";
import tc from "@/i18n/tc.json";

export type Locale = "en" | "tc";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = { en, tc };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  const saved = storage.getString("locale") as Locale | undefined;
  if (saved === "en" || saved === "tc") return saved;
  const deviceLocale = getLocales()[0]?.languageTag ?? "en";
  return deviceLocale.startsWith("zh") ? "tc" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    storage.set("locale", newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
