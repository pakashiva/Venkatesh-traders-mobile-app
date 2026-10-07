export const PAYOUT_CYCLE_DAYS = [1, 5, 10, 15, 20, 25] as const;

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Next cycle day strictly after the day-of-month. Wraps to the 1st. */
export function nextPayoutCycleDay(dayOfMonth: number): number {
  const next = PAYOUT_CYCLE_DAYS.find((day) => day > dayOfMonth);
  return next ?? 1;
}

/** Calendar date of that cycle day on or after the base date. */
export function payDateForCycle(base: Date, payoutDay: number): Date {
  const day = base.getDate();
  if (payoutDay > day) {
    return new Date(base.getFullYear(), base.getMonth(), payoutDay);
  }
  return new Date(base.getFullYear(), base.getMonth() + 1, payoutDay);
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatPayoutDateLabel(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  return `${day} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

export function resolveAutoPayout(baseDate: Date = new Date()): {
  payoutDay: number;
  payDate: Date;
  payDateIso: string;
  label: string;
} {
  const payoutDay = nextPayoutCycleDay(baseDate.getDate());
  const payDate = payDateForCycle(baseDate, payoutDay);
  return {
    payoutDay,
    payDate,
    payDateIso: toIsoDate(payDate),
    label: formatPayoutDateLabel(payDate),
  };
}
