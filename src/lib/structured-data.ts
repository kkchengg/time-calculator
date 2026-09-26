export interface WebApplicationJsonLdInput {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildWebApplicationJsonLd(
  input: WebApplicationJsonLdInput,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    inLanguage: input.inLanguage,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function buildFaqJsonLd(items: FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

/** Serializes JSON-LD, escaping `<` so the string cannot close its script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
