import { useEffect } from 'react';

import { AboutSection } from '@/components/about-section';
import { AdSlot } from '@/components/ad-slot';
import { FaqSection } from '@/components/faq-section';
import { SiteFooter } from '@/components/site-footer';
import { TimeCalculator } from '@/components/time-calculator';
import { UsageSection } from '@/components/usage-section';
import { useTranslation } from '@/i18n/i18n-context';
import {
  ADSENSE_SLOT_BOTTOM,
  ADSENSE_SLOT_TOP,
  loadAdSense,
} from '@/lib/adsense';

export default function App() {
  const { t } = useTranslation();

  useEffect(() => {
    loadAdSense();
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[hsl(210_45%_97%)] via-[hsl(192_35%_96%)] to-[hsl(280_25%_97%)] px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
        <TimeCalculator />
        <AdSlot slotId={ADSENSE_SLOT_TOP} label={t('ads.label')} />
        <UsageSection />
        <FaqSection />
        <AboutSection />
        <AdSlot slotId={ADSENSE_SLOT_BOTTOM} label={t('ads.label')} />
        <SiteFooter />
      </div>
    </div>
  );
}
