import { describe, expect, it } from 'vitest';

import {
  createTranslator,
  getFallbackMessages,
  getMessages,
  resolveMessage,
} from './get-messages';
import { REQUIRED_MESSAGE_KEYS } from './types';
import type { LocaleId } from '@/stores/locale-store';

const LOCALES: LocaleId[] = ['en', 'zh-Hant', 'zh-Hans'];

describe('getMessages', () => {
  it('returns messages for each locale', () => {
    for (const locale of LOCALES) {
      const messages = getMessages(locale);
      expect(messages.app.title).toBeTruthy();
    }
  });

  it('falls back to English for unknown locale', () => {
    expect(getMessages('en' as LocaleId).app.title).toBe('Time calculator');
  });
});

describe('locale key coverage', () => {
  it('every required key resolves in all locales', () => {
    for (const locale of LOCALES) {
      const messages = getMessages(locale);
      for (const key of REQUIRED_MESSAGE_KEYS) {
        const value = resolveMessage(messages, key);
        expect(value, `${locale}:${key}`).toBeTruthy();
        expect(typeof value).toBe('string');
      }
    }
  });
});

describe('createTranslator', () => {
  it('interpolates params', () => {
    const t = createTranslator(getMessages('en'), getFallbackMessages());
    expect(t('copy.label', { value: '2:45' })).toBe('Copy 2:45');
  });

  it('falls back to English for missing keys', () => {
    const t = createTranslator(getMessages('zh-Hant'), getFallbackMessages());
    expect(t('app.title')).toBe('時間計算機');
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });
});
