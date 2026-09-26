import type en from './locales/en.json';

export type Messages = typeof en;

export type MessageKey =
  | 'app.title'
  | 'app.description'
  | 'calculation.legend'
  | 'calculation.from'
  | 'calculation.to'
  | 'calculation.placeholderFrom'
  | 'calculation.placeholderTo'
  | 'hint.forwardExample'
  | 'hint.backwardExample'
  | 'forward.title'
  | 'forward.description'
  | 'backward.title'
  | 'backward.description'
  | 'result.duration'
  | 'result.decimalHours'
  | 'result.totalMinutes'
  | 'copy.label'
  | 'units.hourSuffix'
  | 'units.minuteSuffix'
  | 'language.switcherLabel'
  | 'language.en'
  | 'language.zhHant'
  | 'language.zhHans'
  | 'usage.title'
  | 'usage.step1'
  | 'usage.step2'
  | 'usage.step3'
  | 'faq.title'
  | 'faq.q1'
  | 'faq.a1'
  | 'faq.q2'
  | 'faq.a2'
  | 'faq.q3'
  | 'faq.a3'
  | 'faq.q4'
  | 'faq.a4'
  | 'faq.q5'
  | 'faq.a5'
  | 'faq.q6'
  | 'faq.a6'
  | 'about.title'
  | 'about.body'
  | 'ads.label'
  | 'footer.nav'
  | 'footer.privacy'
  | 'footer.cookies'
  | 'footer.settings';

export const REQUIRED_MESSAGE_KEYS: MessageKey[] = [
  'app.title',
  'app.description',
  'calculation.legend',
  'calculation.from',
  'calculation.to',
  'calculation.placeholderFrom',
  'calculation.placeholderTo',
  'hint.forwardExample',
  'hint.backwardExample',
  'forward.title',
  'forward.description',
  'backward.title',
  'backward.description',
  'result.duration',
  'result.decimalHours',
  'result.totalMinutes',
  'copy.label',
  'units.hourSuffix',
  'units.minuteSuffix',
  'language.switcherLabel',
  'language.en',
  'language.zhHant',
  'language.zhHans',
  'usage.title',
  'usage.step1',
  'usage.step2',
  'usage.step3',
  'faq.title',
  'faq.q1',
  'faq.a1',
  'faq.q2',
  'faq.a2',
  'faq.q3',
  'faq.a3',
  'faq.q4',
  'faq.a4',
  'faq.q5',
  'faq.a5',
  'faq.q6',
  'faq.a6',
  'about.title',
  'about.body',
  'ads.label',
  'footer.nav',
  'footer.privacy',
  'footer.cookies',
  'footer.settings',
];
