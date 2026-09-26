import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  localeToHtmlLang,
  useLocaleStore,
  type LocaleId,
} from '@/stores/locale-store';

import {
  createTranslator,
  getFallbackMessages,
  getMessages,
} from './get-messages';

type TranslateFn = ReturnType<typeof createTranslator>;

interface I18nContextValue {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useMemo(() => {
    return createTranslator(getMessages(locale), getFallbackMessages());
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale);
    document.title = t('app.title');
  }, [locale, t]);

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}
