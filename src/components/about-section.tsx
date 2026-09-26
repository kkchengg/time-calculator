import { useTranslation } from '@/i18n/i18n-context';

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="about-title"
      className="w-full rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm"
    >
      <h2 id="about-title" className="text-lg font-semibold tracking-tight">
        {t('about.title')}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t('about.body')}
      </p>
    </section>
  );
}
