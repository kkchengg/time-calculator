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
    expect(backwardDiffMinutes(600, 765)).toBe(165);
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
