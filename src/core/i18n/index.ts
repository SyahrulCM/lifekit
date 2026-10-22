/**
 * LifeKit - i18n Core Hook & Utilities
 * Menyediakan kamus aktif dan fungsi terjemahan berbasis state di useSettingsStore.
 */

import { useMemo, useCallback } from 'react';
import { idTranslations, type Translations } from './id';
import { enTranslations } from './en';
import { useSettingsStore, type Language } from '@/src/features/profile/stores/useSettingsStore';

export * from './id';
export * from './en';

const translationsMap: Record<Language, Translations> = {
  id: idTranslations,
  en: enTranslations,
};

export interface I18nResult {
  i18n: Translations;
  language: Language;
  isId: boolean;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  format: (template: string, vars: Record<string, string | number>) => string;
}

export function formatI18n(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

export function useI18n(): I18nResult {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const i18n = useMemo(() => {
    return translationsMap[language] || idTranslations;
  }, [language]);

  const format = useCallback(
    (template: string, vars: Record<string, string | number>) => {
      return formatI18n(template, vars);
    },
    []
  );

  return {
    i18n,
    language,
    isId: language === 'id',
    isEn: language === 'en',
    setLanguage,
    format,
  };
}

export default useI18n;
