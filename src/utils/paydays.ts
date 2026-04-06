import type { PaymentRule, Project } from '@/types';

import { addDays, fromDateKey, toDateKey } from './dateHelpers';

const BIWEEKLY_INTERVAL_DAYS = 14;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toSafeDate(dateInput: Date | string) {
  return typeof dateInput === 'string' ? fromDateKey(dateInput) : dateInput;
}

function isValidForProjectStart(project: Project, dateKey: string) {
  return !project.startDate || dateKey >= project.startDate;
}

function matchesOneTimeRule(rule: Extract<PaymentRule, { type: 'one_time' }>, dateKey: string) {
  return rule.paymentDate === dateKey;
}

function matchesMonthlyFixedDayRule(rule: Extract<PaymentRule, { type: 'monthly_fixed_day' }>, targetDate: Date) {
  return targetDate.getDate() === rule.paymentDayOfMonth;
}

function matchesWeeklyRule(rule: Extract<PaymentRule, { type: 'weekly' }>, targetDate: Date) {
  return targetDate.getDay() === rule.paymentWeekday;
}

function matchesBiweeklyRule(rule: Extract<PaymentRule, { type: 'biweekly' }>, targetDate: Date) {
  const startDate = fromDateKey(rule.paymentStartDate);
  const differenceInDays = Math.round((targetDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY);

  if (differenceInDays < 0 || differenceInDays % BIWEEKLY_INTERVAL_DAYS !== 0) {
    return false;
  }

  return rule.paymentWeekday === undefined || targetDate.getDay() === rule.paymentWeekday;
}

export function isPaydayForProject(project: Project, dateInput: Date | string) {
  if (!project.paymentRule) {
    return false;
  }

  const targetDate = toSafeDate(dateInput);
  const dateKey = toDateKey(targetDate);

  if (!isValidForProjectStart(project, dateKey)) {
    return false;
  }

  switch (project.paymentRule.type) {
    case 'one_time':
      return matchesOneTimeRule(project.paymentRule, dateKey);
    case 'monthly_fixed_day':
      return matchesMonthlyFixedDayRule(project.paymentRule, targetDate);
    case 'weekly':
      return matchesWeeklyRule(project.paymentRule, targetDate);
    case 'biweekly':
      return matchesBiweeklyRule(project.paymentRule, targetDate);
    default:
      return false;
  }
}

export function getProjectPaydaysForMonth(project: Project, selectedMonth: Date | string) {
  const monthDate = toSafeDate(selectedMonth);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const paydays: string[] = [];

  for (let currentDate = monthStart; currentDate <= monthEnd; currentDate = addDays(currentDate, 1)) {
    if (isPaydayForProject(project, currentDate)) {
      paydays.push(toDateKey(currentDate));
    }
  }

  return paydays;
}
