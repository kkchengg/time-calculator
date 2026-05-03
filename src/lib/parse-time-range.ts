const TIME_WITH_COLON_RE = /^(\d{1,2}):(\d{2})$/;
const COMPACT_DIGITS_RE = /^\d{3,4}$/;

export type ParseTimeRangeErrorCode =
  | 'empty'
  | 'no_separator'
  | 'multiple_separators'
  | 'invalid_time'
  | 'incomplete';

export class ParseTimeRangeError extends Error {
  constructor(
    public readonly code: ParseTimeRangeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ParseTimeRangeError';
  }
}

function normalizeDash(raw: string): string {
  return raw.replace(/\u2013|\u2014/g, '-');
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

function parseTimeToken(token: string, label: string): number {
  const withColon = token.match(TIME_WITH_COLON_RE);
  if (withColon) {
    const hours = Number(withColon[1]);
    const minutes = Number(withColon[2]);
    return validateAndToMinutes(hours, minutes, label);
  }
  return parseCompactTime(token, label);
}

export interface ParsedTimeRange {
  leftMinutes: number;
  rightMinutes: number;
}

export function parseTimeRange(input: string): ParsedTimeRange {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ParseTimeRangeError(
      'empty',
      'Enter a range like 10:00 - 12:45 or 1000 - 1200.',
    );
  }

  const normalized = normalizeDash(trimmed);
  const dashIndex = normalized.indexOf('-');
  if (dashIndex === -1) {
    throw new ParseTimeRangeError(
      'no_separator',
      'Use a hyphen between two times, e.g. 10:00 - 12:45 or 1000-1200.',
    );
  }

  const secondDash = normalized.indexOf('-', dashIndex + 1);
  if (secondDash !== -1) {
    throw new ParseTimeRangeError(
      'multiple_separators',
      'Only one range is supported. Use a single hyphen between two times.',
    );
  }

  const left = normalized.slice(0, dashIndex).trim();
  const right = normalized.slice(dashIndex + 1).trim();

  if (!left || !right) {
    throw new ParseTimeRangeError(
      'incomplete',
      'Enter both times, e.g. 10:00 - 12:45 or 1000 - 1200.',
    );
  }

  return {
    leftMinutes: parseTimeToken(left, left),
    rightMinutes: parseTimeToken(right, right),
  };
}

export function tryParseTimeRange(
  input: string,
): ParsedTimeRange | ParseTimeRangeError {
  try {
    return parseTimeRange(input);
  } catch (e) {
    if (e instanceof ParseTimeRangeError) {
      return e;
    }
    throw e;
  }
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

export function sanitizeTimeDigits(raw: string): string {
  const trimmed = raw.trim();
  const m = trimmed.match(
    /^(\d{1,2})(?::?)(\d{2})\s*(a\.?m\.?|p\.?m\.?)$/i,
  );
  if (m) {
    const sourceHours = Number(m[1]);
    const minutes = Number(m[2]);
    if (minutes < 0 || minutes > 59) {
      return raw.replace(/\D/g, '').slice(0, 4);
    }
    const meridiem = m[3].toLowerCase();
    if (meridiem.startsWith('a')) {
      const hours24 = sourceHours === 12 ? 0 : sourceHours;
      return toCompactFourDigits(hours24, minutes);
    }
    const hours24 = sourceHours === 12 ? 12 : sourceHours + 12;
    return toCompactFourDigits(hours24, minutes);
  }
  return raw.replace(/\D/g, '').slice(0, 4);
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
