// ============================================================
// utils/Strings.ts  —  Localised string lookup.
//                      Add new keys here before using them.
//                      Add new locales when needed.
// ============================================================

const locales = {
  en: {
    play: 'Play',
  },
} as const;

export type Locale = keyof typeof locales;
export type StringKey = keyof typeof locales['en'];

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(key: StringKey): string {
  return locales[currentLocale][key];
}
