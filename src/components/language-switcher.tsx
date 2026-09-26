import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';
import type { LocaleId } from '@/stores/locale-store';

const LOCALES: { id: LocaleId; labelKey: string }[] = [
  { id: 'en', labelKey: 'language.en' },
  { id: 'zh-Hant', labelKey: 'language.zhHant' },
  { id: 'zh-Hans', labelKey: 'language.zhHans' },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/70 bg-white/80 p-0.5 shadow-sm"
      role="group"
      aria-label={t('language.switcherLabel')}
    >
      {LOCALES.map(({ id, labelKey }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 min-w-9 px-2 text-xs font-medium',
            locale === id &&
              'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
          aria-pressed={locale === id}
          onClick={() => setLocale(id)}
        >
          {t(labelKey)}
        </Button>
      ))}
    </div>
  );
}
