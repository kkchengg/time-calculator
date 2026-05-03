import { describe, expect, it } from 'vitest';

import {
  canExtendToValidFourDigitCompact,
  ParseTimeRangeError,
  parseTimeRange,
  sanitizeTimeDigits,
  shouldAutoFocusTimeToAfterFrom,
  tryParseDigitField,
  tryParseTimeRange,
} from './parse-time-range';

describe('parseTimeRange', () => {
  it('parses H:MM - H:MM', () => {
    expect(parseTimeRange('10:00 - 12:45')).toEqual({
      leftMinutes: 600,
      rightMinutes: 765,
    });
  });

  it('trims whitespace', () => {
    expect(parseTimeRange('  10:00  -  12:45  ')).toEqual({
      leftMinutes: 600,
      rightMinutes: 765,
    });
  });

  it('accepts en dash', () => {
    expect(parseTimeRange('10:00 \u2013 12:45')).toEqual({
      leftMinutes: 600,
      rightMinutes: 765,
    });
  });

  it('parses compact HHMM - HHMM', () => {
    expect(parseTimeRange('1000-1200')).toEqual({
      leftMinutes: 600,
      rightMinutes: 720,
    });
    expect(parseTimeRange('1000 - 1200')).toEqual({
      leftMinutes: 600,
      rightMinutes: 720,
    });
  });

  it('parses compact HMM - HMM', () => {
    expect(parseTimeRange('930-1200')).toEqual({
      leftMinutes: 9 * 60 + 30,
      rightMinutes: 720,
    });
  });

  it('rejects multiple hyphens in expression', () => {
    expect(() => parseTimeRange('10:00 - 12:00 - 14:00')).toThrow(
      ParseTimeRangeError,
    );
  });

  it('rejects empty input', () => {
    expect(() => parseTimeRange('')).toThrow(ParseTimeRangeError);
  });

  it('rejects missing separator', () => {
    expect(() => parseTimeRange('10:00')).toThrow(ParseTimeRangeError);
  });

  it('rejects incomplete range', () => {
    expect(() => parseTimeRange('10:00 -')).toThrow(ParseTimeRangeError);
  });

  it('rejects invalid minute', () => {
    expect(() => parseTimeRange('10:00 - 12:60')).toThrow(ParseTimeRangeError);
  });

  it('rejects hour out of range', () => {
    expect(() => parseTimeRange('24:00 - 12:00')).toThrow(ParseTimeRangeError);
  });

  it('tryParse returns error instance', () => {
    const r = tryParseTimeRange('nope');
    expect(r).toBeInstanceOf(ParseTimeRangeError);
  });
});

describe('sanitizeTimeDigits', () => {
  it('strips non-digits and caps length', () => {
    expect(sanitizeTimeDigits('10:00ab')).toBe('1000');
    expect(sanitizeTimeDigits('123456')).toBe('1234');
  });

  it('supports compact and colon AM input', () => {
    expect(sanitizeTimeDigits('0000am')).toBe('0000');
    expect(sanitizeTimeDigits('0000a.m.')).toBe('0000');
    expect(sanitizeTimeDigits('12:00am')).toBe('0000');
    expect(sanitizeTimeDigits('12:00a.m.')).toBe('0000');
  });

  it('supports 24-hour colon input', () => {
    expect(sanitizeTimeDigits('00:00')).toBe('0000');
  });
});

describe('tryParseDigitField', () => {
  it('parses 3 and 4 digit compact times', () => {
    expect(tryParseDigitField('930')).toEqual({
      status: 'ok',
      minutes: 9 * 60 + 30,
    });
    expect(tryParseDigitField('1000')).toEqual({
      status: 'ok',
      minutes: 10 * 60,
    });
  });

  it('returns incomplete for short input', () => {
    expect(tryParseDigitField('')).toEqual({ status: 'empty' });
    expect(tryParseDigitField('12')).toEqual({ status: 'incomplete' });
  });
});

describe('canExtendToValidFourDigitCompact', () => {
  it('detects prefix of valid HHMM', () => {
    expect(canExtendToValidFourDigitCompact('100')).toBe(true);
    expect(canExtendToValidFourDigitCompact('123')).toBe(true);
  });

  it('is false when no fourth digit yields valid time', () => {
    expect(canExtendToValidFourDigitCompact('930')).toBe(false);
  });
});

describe('shouldAutoFocusTimeToAfterFrom', () => {
  it('is true after 4 valid digits', () => {
    expect(shouldAutoFocusTimeToAfterFrom('1000')).toBe(true);
  });

  it('is true after 3 digits when not extendable', () => {
    expect(shouldAutoFocusTimeToAfterFrom('930')).toBe(true);
  });

  it('is false when 3 digits can still become valid HHMM', () => {
    expect(shouldAutoFocusTimeToAfterFrom('100')).toBe(false);
  });
});
