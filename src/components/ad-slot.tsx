import { useEffect, useRef } from 'react';

import { ADSENSE_CLIENT_ID, requestAd } from '@/lib/adsense';

interface AdSlotProps {
  slotId: string | undefined;
  label: string;
}

const MIN_HEIGHT = 280;

export function AdSlot({ slotId, label }: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slotId || pushed.current) {
      return;
    }
    pushed.current = true;
    requestAd();
  }, [slotId]);

  if (!slotId) {
    if (!import.meta.env.DEV) {
      return null;
    }
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-border/70 text-xs text-muted-foreground"
        style={{ minHeight: MIN_HEIGHT }}
      >
        {label}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: MIN_HEIGHT }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
