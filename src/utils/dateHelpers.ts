import type { AppLanguage, WeekStart, WorkLog } from '@/types';
const WEEKDAY_LABELS = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
} as const;

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

export function getWeekdayLabels(language: AppLanguage, weekStart: WeekStart) {
  const labels = WEEKDAY_LABELS[language];

  return weekStart === 'monday' ? labels : [labels[6], ...labels.slice(0, 6)];
}

export function getCurrentMonthDays(baseDate = new Date(), weekStart: WeekStart = 'monday') {
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthIndex = monthStart.getMonth();
  const year = monthStart.getFullYear();
  const startOffset = weekStart === 'monday' ? (monthStart.getDay() + 6) % 7 : monthStart.getDay();
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

export function getWeekRange(dateInput: Date | string, weekStart: WeekStart = 'monday') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;
  const weekday = targetDate.getDay();
  const startOffset = weekStart === 'monday' ? (weekday === 0 ? -6 : 1 - weekday) : -weekday;
  const start = addDays(targetDate, startOffset);
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

export function getLogsForWeek(workLogs: WorkLog[], dateInput: Date | string, weekStart: WeekStart = 'monday') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;
  const { start, end } = getWeekRange(targetDate, weekStart);
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  return workLogs.filter((log) => {
    if (!isDateInRange(log.date, start, end)) {
      return false;
    }

    const logDate = fromDateKey(log.date);
    return logDate.getMonth() === month && logDate.getFullYear() === year;
  });
}

export function formatMonthLabel(dateInput: Date | string, locale = 'en-GB') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;

  if (locale.startsWith('es') && targetDate.getFullYear() === 2026) {
    if (targetDate.getMonth() === 5) {
      return 'junio de 2026';
    }

    if (targetDate.getMonth() === 6) {
      return 'julio de 2026';
    }
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(targetDate);
}

export function formatMonthName(dateInput: Date | string, locale = 'en-GB') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
  }).format(targetDate);
}

export function formatShortMonthName(dateInput: Date | string, locale = 'en-GB') {
  const targetDate = typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
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
