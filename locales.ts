export type LocaleCode = "zh_Hans" | "en";

export interface LocaleMetadata {
  readonly code: LocaleCode;
  readonly name: string;
}

export const supportedLocales: ReadonlyArray<LocaleMetadata> = Object.freeze([
  Object.freeze({ code: "zh_Hans", name: "简体中文" }),
  Object.freeze({ code: "en", name: "English" })
]);

export const defaultLocale: LocaleCode = "zh_Hans";

export function getLocaleMetadata(code: string): LocaleMetadata | undefined {
  return supportedLocales.find((locale) => locale.code === code);
}
