import { useTranslation } from '@/i18n/i18n-context';

export function UsageSection() {
  const { t } = useTranslation();
  const steps = [t('usage.step1'), t('usage.step2'), t('usage.step3')];

  return (
    <section
      aria-labelledby="usage-title"
      className="w-full rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm"
    >
      <h2 id="usage-title" className="text-lg font-semibold tracking-tight">
        {t('usage.title')}
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
