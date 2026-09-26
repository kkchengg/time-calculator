import { describe, expect, it } from 'vitest';

import {
  backwardDiffMinutes,
  formatDecimalHours,
  formatDuration,
  formatTotalMinutes,
  forwardSpanMinutes,
} from './time-math';

describe('backwardDiffMinutes', () => {
  it('matches order-independent difference', () => {
    expect(backwardDiffMinutes(600, 765)).toBe(1275);
    expect(backwardDiffMinutes(765, 600)).toBe(165);
  });

  it('handles 22:00 vs 06:00', () => {
    const a = 22 * 60;
    const b = 6 * 60;
    expect(backwardDiffMinutes(a, b)).toBe(960);
  });
});

describe('forwardSpanMinutes', () => {
  it('same-day forward', () => {
    expect(forwardSpanMinutes(600, 765)).toBe(165);
  });

  it('wraps past midnight', () => {
    const start = 22 * 60;
    const end = 6 * 60;
    expect(forwardSpanMinutes(start, end)).toBe(8 * 60);
  });
});

describe('formatters', () => {
  it('formatDuration', () => {
    expect(formatDuration(165)).toBe('2:45');
    expect(formatDuration(8 * 60)).toBe('8:00');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formatDecimalHours', () => {
    expect(formatDecimalHours(165)).toBe('2.75 hr');
  });

  it('formatTotalMinutes', () => {
    expect(formatTotalMinutes(165)).toBe('165 min');
  });
});

describe('span boundaries and wrap-around', () => {
  it.each([
    [0, 0, 0],
    [0, 1439, 1439],
    [1439, 0, 1],
    [1439, 1439, 0],
    [720, 720, 0],
  ])('forwardSpanMinutes(%i, %i) === %i', (start, end, expected) => {
    expect(forwardSpanMinutes(start, end)).toBe(expected);
  });

  it.each([
    [0, 0, 0],
    [0, 1439, 1],
    [1439, 0, 1439],
    [1439, 1439, 0],
    [600, 600, 0],
  ])('backwardDiffMinutes(%i, %i) === %i', (left, right, expected) => {
    expect(backwardDiffMinutes(left, right)).toBe(expected);
  });

  it('forward and backward are complementary within a day', () => {
    for (let left = 0; left < 24 * 60; left += 37) {
      for (let right = 0; right < 24 * 60; right += 53) {
        const forward = forwardSpanMinutes(left, right);
        const backward = backwardDiffMinutes(left, right);
        if (left === right) {
          expect(forward).toBe(0);
          expect(backward).toBe(0);
        } else {
          expect(forward).toBeGreaterThan(0);
          expect(backward).toBeGreaterThan(0);
          expect(forward + backward).toBe(24 * 60);
        }
      }
    }
  });
});

describe('formatter edge cases', () => {
  it.each([
    [0, '0:00'],
    [59, '0:59'],
    [60, '1:00'],
    [1439, '23:59'],
    [1440, '24:00'],
    [1500, '25:00'],
  ])('formatDuration(%i) === %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it('clamps negative durations to 0:00', () => {
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(-90)).toBe('0:00');
  });

  it('floors fractional minutes before formatting', () => {
    expect(formatDuration(59.9)).toBe('0:59');
    expect(formatDuration(60.4)).toBe('1:00');
  });

  it('leaks NaN for non-finite input (characterization)', () => {
    expect(formatDuration(Number.NaN)).toBe('NaN:NaN');
  });

  it('rounds total minutes half-up', () => {
    expect(formatTotalMinutes(0.4)).toBe('0 min');
    expect(formatTotalMinutes(0.5)).toBe('1 min');
    expect(formatTotalMinutes(2.5)).toBe('3 min');
    expect(formatTotalMinutes(59.5)).toBe('60 min');
  });

  it('formats decimal hours with configurable digits and suffix', () => {
    expect(formatDecimalHours(165, 0)).toBe('3 hr');
    expect(formatDecimalHours(165, 2, 'h')).toBe('2.75h');
  });

  it('does not clamp negative decimal hours (characterization)', () => {
    expect(formatDecimalHours(-30)).toBe('-0.50 hr');
  });
});
