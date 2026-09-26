const SCRIPT_ID = 'adsbygoogle-loader';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    googlefc?: {
      showRevocationMessage?: () => void;
    };
  }
}

/** Reads a Vite env var, treating empty/whitespace strings as unset. */
function readEnv(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

const ADSENSE_CLIENT =
  readEnv(import.meta.env.VITE_ADSENSE_CLIENT) ?? 'ca-pub-6689056038494624';

/** Publisher ID passed to the AdSense loader and every ad unit. */
export const ADSENSE_CLIENT_ID = ADSENSE_CLIENT;

/** Ad unit slot IDs come from AdSense > Ads > By ad unit. */
export const ADSENSE_SLOT_TOP = readEnv(import.meta.env.VITE_ADSENSE_SLOT_TOP);

export const ADSENSE_SLOT_BOTTOM = readEnv(
  import.meta.env.VITE_ADSENSE_SLOT_BOTTOM,
);

/**
 * Injects the Google AdSense loader exactly once. Google's certified consent
 * management platform (configured under AdSense > Privacy & messaging) runs
 * from this tag and handles EEA/UK/Switzerland consent, so it must be present
 * on every page load.
 */
export function loadAdSense(): void {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

/** Queues one `<ins class="adsbygoogle">` element for rendering. */
export function requestAd(): void {
  if (typeof window === 'undefined') {
    return;
  }
  (window.adsbygoogle = window.adsbygoogle ?? []).push({});
}

/** Re-opens the Google consent message so a visitor can change their choice. */
export function openAdConsentSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.googlefc?.showRevocationMessage?.();
}
