import { useTranslation } from '@/i18n/i18n-context';
import {
  buildFaqJsonLd,
  buildWebApplicationJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';

const SITE_URL = 'https://kkchengg.github.io/time-calculator/';
const FAQ_ITEMS = [1, 2, 3, 4, 5, 6] as const;

export function StructuredData() {
  const { t, locale } = useTranslation();

  const webApplication = buildWebApplicationJsonLd({
    name: t('app.title'),
    description: t('app.description'),
    url: SITE_URL,
    inLanguage: locale,
  });

  const faq = buildFaqJsonLd(
    FAQ_ITEMS.map((n) => ({
      question: t(`faq.q${n}`),
      answer: t(`faq.a${n}`),
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faq) }}
      />
    </>
  );
}
