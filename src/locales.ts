export type LocaleCode = "zh_Hans" | "en";

export interface LocaleMetadata {
  code: LocaleCode;
  name: string;
}

export const supportedLocales: LocaleMetadata[] = [
  { code: "zh_Hans", name: "简体中文" },
  { code: "en", name: "English" }
];

export const defaultLocale: LocaleCode = "zh_Hans";

export function getLocaleMetadata(code: string): LocaleMetadata | undefined {
  return supportedLocales.find((locale) => locale.code === code);
}