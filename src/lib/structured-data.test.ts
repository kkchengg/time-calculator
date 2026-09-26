import { describe, expect, it } from 'vitest';

import {
  buildFaqJsonLd,
  buildWebApplicationJsonLd,
  serializeJsonLd,
} from './structured-data';

describe('buildWebApplicationJsonLd', () => {
  it('produces a free WebApplication node', () => {
    const data = buildWebApplicationJsonLd({
      name: 'Time calculator',
      description: 'Find the duration between two times.',
      url: 'https://example.com/',
      inLanguage: 'en',
    });

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Time calculator',
      description: 'Find the duration between two times.',
      url: 'https://example.com/',
      applicationCategory: 'UtilitiesApplication',
      inLanguage: 'en',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  });
});

describe('buildFaqJsonLd', () => {
  it('maps questions and answers into mainEntity', () => {
    const data = buildFaqJsonLd([{ question: 'Q1', answer: 'A1' }]);

    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q1',
          acceptedAnswer: { '@type': 'Answer', text: 'A1' },
        },
      ],
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets so the script tag cannot be closed', () => {
    expect(serializeJsonLd({ text: '</script><b>' })).toBe(
      '{"text":"\\u003c/script>\\u003cb>"}',
    );
  });
});
