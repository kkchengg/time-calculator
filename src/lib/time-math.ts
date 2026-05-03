const MINUTES_PER_DAY = 24 * 60;

export function backwardDiffMinutes(
  leftMinutes: number,
  rightMinutes: number,
): number {
  return (leftMinutes - rightMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function forwardSpanMinutes(
  startMinutes: number,
  endMinutes: number,
): number {
  if (endMinutes >= startMinutes) {
    return endMinutes - startMinutes;
  }
  return MINUTES_PER_DAY - startMinutes + endMinutes;
}

export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, '0')}`;
}

export function formatDecimalHours(
  totalMinutes: number,
  fractionDigits = 2,
): string {
  const hours = totalMinutes / 60;
  return `${hours.toFixed(fractionDigits)} hr`;
}

export function formatTotalMinutes(totalMinutes: number): string {
  return `${Math.round(totalMinutes)} min`;
}
