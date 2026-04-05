import type { CurrencyCode, Project, WeekdayEstimationKey, WorkLog } from '@/types';

import { addDays, toDateKey } from './dateHelpers';

export type CurrencyTotals = Partial<Record<CurrencyCode, number>>;

export function calculateDailyEarnings(log: WorkLog, project?: Project) {
  if (!project) {
    return 0;
  }

  return log.hoursWorked * project.hourlyRate;
}

export function calculateWeeklyTotal(logs: WorkLog[], projects: Project[]) {
  return calculateLogsTotal(logs, projects);
}

export function calculateMonthlyTotal(logs: WorkLog[], projects: Project[]) {
  return calculateLogsTotal(logs, projects);
}

export function calculateHoursTotal(logs: WorkLog[]) {
  return logs.reduce((total, log) => total + log.hoursWorked, 0);
}

export function calculateLogsTotal(logs: WorkLog[], projects: Project[]) {
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return logs.reduce((total, log) => {
    return total + calculateDailyEarnings(log, projectMap.get(log.projectId));
  }, 0);
}

export function calculateCurrencyTotals(logs: WorkLog[], projects: Project[]): CurrencyTotals {
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return logs.reduce<CurrencyTotals>((totals, log) => {
    const project = projectMap.get(log.projectId);

    if (!project) {
      return totals;
    }

    const earnings = calculateDailyEarnings(log, project);
    const currentValue = totals[project.currency] ?? 0;

    return {
      ...totals,
      [project.currency]: currentValue + earnings,
    };
  }, {});
}

const WEEKDAY_ESTIMATION_KEYS: Record<number, WeekdayEstimationKey> = {
  0: 'sunHours',
  1: 'monHours',
  2: 'tueHours',
  3: 'wedHours',
  4: 'thuHours',
  5: 'friHours',
  6: 'satHours',
};

export function hasWeeklyEstimation(project: Project) {
  return Boolean(project.weeklyEstimation) && Object.values(project.weeklyEstimation ?? {}).some((value) => value > 0);
}

export function calculateProjectMonthlyProjection(
  project: Project,
  workLogs: WorkLog[],
  holidayDates: string[],
  baseDate = new Date(),
) {
  if (!project.weeklyEstimation || !hasWeeklyEstimation(project)) {
    return 0;
  }

  const currentDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const projectionStart = currentDay > monthStart ? currentDay : monthStart;
  const holidayDateSet = new Set(holidayDates);
  const loggedHoursByDate = workLogs.reduce<Record<string, number>>((totals, log) => {
    if (log.projectId !== project.id) {
      return totals;
    }

    return {
      ...totals,
      [log.date]: (totals[log.date] ?? 0) + log.hoursWorked,
    };
  }, {});
  let total = 0;

  if (projectionStart > monthEnd) {
    return 0;
  }

  for (let cursor = projectionStart; cursor <= monthEnd; cursor = addDays(cursor, 1)) {
    const dateKey = toDateKey(cursor);

    if (dateKey < project.startDate) {
      continue;
    }

    if (holidayDateSet.has(dateKey)) {
      continue;
    }

    const estimationKey = WEEKDAY_ESTIMATION_KEYS[cursor.getDay()];
    const estimatedHours = project.weeklyEstimation[estimationKey] ?? 0;
    const loggedHours = loggedHoursByDate[dateKey] ?? 0;
    const remainingHours = Math.max(estimatedHours - loggedHours, 0);

    if (remainingHours <= 0) {
      continue;
    }

    total += remainingHours * project.hourlyRate;
  }

  return Number(total.toFixed(2));
}

export function calculateMonthlyProjectionTotals(
  projects: Project[],
  workLogs: WorkLog[],
  holidayDates: string[],
  baseDate = new Date(),
): CurrencyTotals {
  return projects.reduce<CurrencyTotals>((totals, project) => {
    const projectedTotal = calculateProjectMonthlyProjection(project, workLogs, holidayDates, baseDate);

    if (projectedTotal <= 0) {
      return totals;
    }

    return {
      ...totals,
      [project.currency]: Number(((totals[project.currency] ?? 0) + projectedTotal).toFixed(2)),
    };
  }, {});
}
