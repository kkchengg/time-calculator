import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LocaleId = 'en' | 'zh-Hant' | 'zh-Hans';

export function detectBrowserLocale(): LocaleId {
  // During prerendering there is no window; always emit the default locale.
  if (typeof window === 'undefined') {
    return 'en';
  }
  const lang = (navigator.language ?? '').toLowerCase();
  if (
    lang === 'zh-tw' ||
    lang === 'zh-hk' ||
    lang.startsWith('zh-hant')
  ) {
    return 'zh-Hant';
  }
  if (
    lang === 'zh-cn' ||
    lang === 'zh-sg' ||
    lang.startsWith('zh-hans')
  ) {
    return 'zh-Hans';
  }
  if (lang.startsWith('zh')) {
    return 'zh-Hant';
  }
  return 'en';
}

export function localeToHtmlLang(locale: LocaleId): string {
  return locale;
}

interface LocaleState {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detectBrowserLocale(),
      setLocale: (locale) => {
        document.documentElement.lang = localeToHtmlLang(locale);
        set({ locale });
      },
    }),
    {
      name: 'time-calculator-locale',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.lang = localeToHtmlLang(state.locale);
        }
      },
    },
  ),
);
