import type { LocaleId } from '@/stores/locale-store';

import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';
import zhHant from './locales/zh-Hant.json';
import type { Messages } from './types';

const messagesByLocale: Record<LocaleId, Messages> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};

export function getMessages(locale: LocaleId): Messages {
  return messagesByLocale[locale] ?? en;
}

export function getFallbackMessages(): Messages {
  return en;
}

export function resolveMessage(
  messages: Messages,
  key: string,
): string | undefined {
  const parts = key.split('.');
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function createTranslator(
  messages: Messages,
  fallback: Messages = getFallbackMessages(),
) {
  return function translate(
    key: string,
    params?: Record<string, string>,
  ): string {
    let value = resolveMessage(messages, key) ?? resolveMessage(fallback, key) ?? key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replaceAll(`{{${paramKey}}}`, paramValue);
      }
    }
    return value;
  };
}
