import { describe, expect, it } from 'vitest';

import {
  canExtendToValidFourDigitCompact,
  ParseTimeRangeError,
  sanitizeTimeDigits,
  shouldAutoFocusTimeToAfterFrom,
  tryParseDigitField,
} from './parse-time-range';

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

  it('converts am/pm to 24-hour compact digits', () => {
    expect(sanitizeTimeDigits('12:00pm')).toBe('1200');
    expect(sanitizeTimeDigits('1:00pm')).toBe('1300');
    expect(sanitizeTimeDigits('0:00am')).toBe('0000');
    expect(sanitizeTimeDigits('10:05 pm')).toBe('2205');
  });

  it('accepts single-digit minutes when a colon is present', () => {
    expect(sanitizeTimeDigits('10:5pm')).toBe('2205');
    expect(sanitizeTimeDigits('12:5am')).toBe('0005');
    expect(sanitizeTimeDigits('1:5pm')).toBe('1305');
    expect(sanitizeTimeDigits('10:5')).toBe('1005');
  });

  it('falls back to stripping digits when the time is out of range', () => {
    expect(sanitizeTimeDigits('12:60pm')).toBe('1260');
  });

  it('converts the hour without validating it (characterization)', () => {
    expect(sanitizeTimeDigits('13:00pm')).toBe('2500');
  });

  it('returns empty for blank input', () => {
    expect(sanitizeTimeDigits('   ')).toBe('');
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

  it('returns empty/incomplete for short input', () => {
    expect(tryParseDigitField('')).toEqual({ status: 'empty' });
    expect(tryParseDigitField('12')).toEqual({ status: 'incomplete' });
  });

  it.each([
    ['000', 0],
    ['001', 1],
    ['059', 59],
    ['100', 60],
    ['600', 360],
    ['2359', 1439],
  ])('parses %s', (digits, minutes) => {
    expect(tryParseDigitField(digits)).toEqual({ status: 'ok', minutes });
  });

  it('parses pasted 12-hour times with single-digit minutes', () => {
    expect(tryParseDigitField('10:5pm')).toEqual({
      status: 'ok',
      minutes: 22 * 60 + 5,
    });
    expect(tryParseDigitField('12:5am')).toEqual({ status: 'ok', minutes: 5 });
  });

  it.each(['060', '2400', '2360'])('rejects %s as invalid_time', (digits) => {
    const result = tryParseDigitField(digits);
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.error).toBeInstanceOf(ParseTimeRangeError);
      expect(result.error.code).toBe('invalid_time');
    }
  });
});

describe('canExtendToValidFourDigitCompact', () => {
  it.each([
    ['000', true],
    ['001', true],
    ['100', true],
    ['123', true],
    ['059', false],
    ['240', false],
    ['930', false],
    ['999', false],
    ['0000', false],
  ])('canExtendToValidFourDigitCompact(%s) === %s', (input, expected) => {
    expect(canExtendToValidFourDigitCompact(input)).toBe(expected);
  });
});

describe('shouldAutoFocusTimeToAfterFrom', () => {
  it.each([
    ['', false],
    ['1', false],
    ['10', false],
    ['100', false],
    ['059', true],
    ['240', true],
    ['930', true],
    ['1000', true],
    ['2359', true],
    ['2400', false],
  ])('shouldAutoFocusTimeToAfterFrom(%s) === %s', (input, expected) => {
    expect(shouldAutoFocusTimeToAfterFrom(input)).toBe(expected);
  });
});
