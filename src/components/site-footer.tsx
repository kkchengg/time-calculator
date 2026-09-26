import { useTranslation } from '@/i18n/i18n-context';
import { openAdConsentSettings } from '@/lib/adsense';

const BASE_URL = import.meta.env.BASE_URL;

export function SiteFooter() {
  const { t } = useTranslation();
  const linkClass = 'hover:text-foreground hover:underline';

  return (
    <footer className="w-full border-t border-border/70 pt-6 pb-2">
      <nav
        aria-label={t('footer.nav')}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
      >
        <a className={linkClass} href={`${BASE_URL}privacy.html`}>
          {t('footer.privacy')}
        </a>
        <a className={linkClass} href={`${BASE_URL}cookie.html`}>
          {t('footer.cookies')}
        </a>
        <button
          type="button"
          className={linkClass}
          onClick={openAdConsentSettings}
        >
          {t('footer.settings')}
        </button>
      </nav>
    </footer>
  );
}
