import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "../en.json";
import zhHans from "../zh_Hans.json";

type Locale = "zh_Hans" | "en";
type Dictionary = Record<string, string>;
type Variables = Record<string, string | number>;

const storageKey = "dugout_locale";

const resources: Record<Locale, Dictionary> = {
  zh_Hans: zhHans as Dictionary,
  en: en as Dictionary
};

export const supportedLocales = [
  { code: "zh_Hans", name: "简体中文" },
  { code: "en", name: "English" }
];

export const defaultLocale: Locale = "zh_Hans";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Variables) => string;
  isLoading: boolean;
};

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string) => key,
  isLoading: false
});

function getStorageSafe(): Storage | null {
  try {
    if (typeof globalThis === "undefined" || !globalThis.localStorage) {
      return null;
    }
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function renderTemplate(text: string, variables?: Variables): string {
  if (!variables) return text;
  let out = text;
  for (const [name, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
  }
  return out;
}

export function getStaticTranslation(locale: string, key: string): string {
  const dict = resources[(locale as Locale) in resources ? (locale as Locale) : defaultLocale];
  return dict[key] ?? resources[defaultLocale][key] ?? key;
}

export function I18nProvider(props: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(props.initialLocale ?? defaultLocale);

  useEffect(() => {
    const storage = getStorageSafe();
    const saved = storage?.getItem(storageKey);
    if (saved === "zh_Hans" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    const storage = getStorageSafe();
    storage?.setItem(storageKey, next);
  };

  const t = useMemo(() => {
    return (key: string, variables?: Variables) => {
      const dict = resources[locale] ?? resources[defaultLocale];
      return renderTemplate(dict[key] ?? resources[defaultLocale][key] ?? key, variables);
    };
  }, [locale]);

  return <I18nContext.Provider value={{ locale, setLocale, t, isLoading: false }}>{props.children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
