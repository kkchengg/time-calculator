import { useTranslation } from '@/i18n/i18n-context';

const FAQ_ITEMS = [1, 2, 3, 4, 5, 6] as const;

export function FaqSection() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="faq-title"
      className="w-full rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm"
    >
      <h2 id="faq-title" className="text-lg font-semibold tracking-tight">
        {t('faq.title')}
      </h2>
      <dl className="mt-3 space-y-4">
        {FAQ_ITEMS.map((n) => {
          const question = t(`faq.q${n}`);
          return (
            <div key={question}>
              <dt className="text-sm font-medium text-foreground">
                {question}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`faq.a${n}`)}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
