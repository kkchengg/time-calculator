const COMPACT_DIGITS_RE = /^\d{3,4}$/;

export type ParseTimeRangeErrorCode = 'invalid_time';

export class ParseTimeRangeError extends Error {
  constructor(
    public readonly code: ParseTimeRangeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ParseTimeRangeError';
  }
}

function validateAndToMinutes(
  hours: number,
  minutes: number,
  label: string,
): number {
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new ParseTimeRangeError(
      'invalid_time',
      `Invalid time "${label.trim()}". Hours 0–23, minutes 00–59.`,
    );
  }
  return hours * 60 + minutes;
}

function parseCompactTime(token: string, label: string): number {
  if (!COMPACT_DIGITS_RE.test(token)) {
    throw new ParseTimeRangeError(
      'invalid_time',
      `Invalid time "${label.trim()}". Use H:MM, HH:MM, or compact HMM / HHMM (e.g. 930, 1000).`,
    );
  }
  let hours: number;
  let minutes: number;
  if (token.length === 4) {
    hours = Number(token.slice(0, 2));
    minutes = Number(token.slice(2, 4));
  } else {
    hours = Number(token.slice(0, 1));
    minutes = Number(token.slice(1, 3));
  }
  return validateAndToMinutes(hours, minutes, label);
}

const DIGITS_ONLY_FIELD_RE = /^\d{1,4}$/;

export type DigitFieldParseResult =
  | { status: 'empty' }
  | { status: 'incomplete' }
  | { status: 'error'; error: ParseTimeRangeError }
  | { status: 'ok'; minutes: number };

function toCompactFourDigits(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
}

// 12-hour clock input with an am/pm suffix and an optional colon:
// "10:5pm", "10:05 pm", "1005pm", "930am". Minutes may be a single digit only
// when a colon is present, so bare "10pm" stays ambiguous and falls through to
// the plain digit-stripping path below.
const MERIDIEM_RE =
  /^(\d{1,2})(?::(\d{1,2})|(\d{2}))\s*(a\.?m\.?|p\.?m\.?)$/i;
const COLON_TIME_RE = /^(\d{1,2}):(\d{1,2})$/;

function to24Hour(sourceHours: number, isAm: boolean): number {
  if (sourceHours === 12) {
    return isAm ? 0 : 12;
  }
  return isAm ? sourceHours : sourceHours + 12;
}

export function sanitizeTimeDigits(raw: string): string {
  const trimmed = raw.trim();

  const meridiem = trimmed.match(MERIDIEM_RE);
  if (meridiem) {
    const sourceHours = Number(meridiem[1]);
    const minutes = Number(meridiem[2] ?? meridiem[3]);
    const isAm = meridiem[4].toLowerCase().startsWith('a');
    return toCompactFourDigits(to24Hour(sourceHours, isAm), minutes);
  }

  const colon = trimmed.match(COLON_TIME_RE);
  if (colon) {
    return toCompactFourDigits(Number(colon[1]), Number(colon[2]));
  }

  return trimmed.replace(/\D/g, '').slice(0, 4);
}

export function tryParseDigitField(digits: string): DigitFieldParseResult {
  const d = sanitizeTimeDigits(digits);
  if (d.length === 0) {
    return { status: 'empty' };
  }
  if (d.length < 3) {
    return { status: 'incomplete' };
  }
  if (!DIGITS_ONLY_FIELD_RE.test(d)) {
    return { status: 'incomplete' };
  }
  try {
    return { status: 'ok', minutes: parseCompactTime(d, d) };
  } catch (e) {
    if (e instanceof ParseTimeRangeError) {
      return { status: 'error', error: e };
    }
    throw e;
  }
}

function compactFourDigitIsValid(four: string): boolean {
  if (four.length !== 4 || !/^\d{4}$/.test(four)) {
    return false;
  }
  try {
    parseCompactTime(four, four);
    return true;
  } catch {
    return false;
  }
}

export function canExtendToValidFourDigitCompact(three: string): boolean {
  const t = sanitizeTimeDigits(three);
  if (t.length !== 3) {
    return false;
  }
  for (let i = 0; i <= 9; i++) {
    if (compactFourDigitIsValid(t + String(i))) {
      return true;
    }
  }
  return false;
}

export function shouldAutoFocusTimeToAfterFrom(fromDigits: string): boolean {
  const d = sanitizeTimeDigits(fromDigits);
  const parsed = tryParseDigitField(d);
  if (parsed.status !== 'ok') {
    return false;
  }
  if (d.length === 4) {
    return true;
  }
  if (d.length === 3) {
    return !canExtendToValidFourDigitCompact(d);
  }
  return false;
}
