import type { WorkLog } from '@/types';

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getCurrentMonthDays(baseDate = new Date()) {
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthIndex = monthStart.getMonth();
  const year = monthStart.getFullYear();
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -startOffset);
  const todayKey = toDateKey(new Date());

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = addDays(gridStart, index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthIndex && date.getFullYear() === year,
      isToday: dateKey === todayKey,
    };
  });
}

export function getWeekRange(dateInput: Date | string) {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;
  const weekday = targetDate.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = addDays(targetDate, mondayOffset);
  const end = addDays(start, 6);

  return { start, end };
}

export function isDateInRange(dateKey: string, start: Date, end: Date) {
  const target = fromDateKey(dateKey).getTime();
  return target >= fromDateKey(toDateKey(start)).getTime() && target <= fromDateKey(toDateKey(end)).getTime();
}

export function getLogsForDate(workLogs: WorkLog[], dateKey: string) {
  return workLogs.filter((log) => log.date === dateKey);
}

export function getLogsForMonth(workLogs: WorkLog[], dateInput: Date | string) {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  return workLogs.filter((log) => {
    const logDate = fromDateKey(log.date);
    return logDate.getMonth() === month && logDate.getFullYear() === year;
  });
}

export function getLogsForWeek(workLogs: WorkLog[], dateInput: Date | string) {
  const { start, end } = getWeekRange(dateInput);
  return workLogs.filter((log) => isDateInRange(log.date, start, end));
}

export function formatMonthLabel(dateInput: Date | string, locale = 'en-GB') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(targetDate);
}

export function formatLongDate(dateInput: Date | string, locale = 'en-GB') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(targetDate);
}
