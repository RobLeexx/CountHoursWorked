import { useCallback, useMemo } from 'react';

import { useAppContext } from '@/context';
import {
  calculateCurrencyTotals,
  calculateHoursTotal,
  getLogsForDate,
  getLogsForMonth,
  getLogsForWeek,
  toDateKey,
} from '@/utils';

const MAX_HOURS_PER_DAY = 24;

export function useWorkLogs(selectedDateInput?: string | Date) {
  const { workLogs, projects, addWorkLog, updateWorkLog, deleteWorkLog, weekStart } = useAppContext();
  const selectedDate = useMemo(() => {
    if (!selectedDateInput) {
      return toDateKey(new Date());
    }

    return typeof selectedDateInput === 'string' ? selectedDateInput : toDateKey(selectedDateInput);
  }, [selectedDateInput]);

  const dayLogs = useMemo(() => getLogsForDate(workLogs, selectedDate), [selectedDate, workLogs]);
  const weeklyLogs = useMemo(() => getLogsForWeek(workLogs, selectedDate, weekStart), [selectedDate, weekStart, workLogs]);
  const monthlyLogs = useMemo(() => getLogsForMonth(workLogs, selectedDate), [selectedDate, workLogs]);
  const getLogForProject = useCallback(
    (projectId: string) => dayLogs.find((log) => log.projectId === projectId),
    [dayLogs],
  );
  const setHoursForProject = useCallback(
    (projectId: string, hoursWorked: number) => {
      const existingLog = getLogForProject(projectId);
      const otherProjectHours = dayLogs.reduce(
        (total, log) => (log.projectId === projectId ? total : total + log.hoursWorked),
        0,
      );

      if (hoursWorked < 0 || otherProjectHours + hoursWorked > MAX_HOURS_PER_DAY) {
        return;
      }

      if (existingLog) {
        updateWorkLog(existingLog.id, { hoursWorked });
        return;
      }

      addWorkLog({ date: selectedDate, projectId, hoursWorked });
    },
    [addWorkLog, dayLogs, getLogForProject, selectedDate, updateWorkLog],
  );
  const clearHoursForProject = useCallback(
    (projectId: string) => {
      const existingLog = getLogForProject(projectId);

      if (existingLog) {
        deleteWorkLog(existingLog.id);
      }
    },
    [deleteWorkLog, getLogForProject],
  );

  return {
    workLogs,
    dayLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    getLogForProject,
    setHoursForProject,
    clearHoursForProject,
    dailyHours: calculateHoursTotal(dayLogs),
    weeklyHours: calculateHoursTotal(weeklyLogs),
    monthlyHours: calculateHoursTotal(monthlyLogs),
    dailyEarningsByCurrency: calculateCurrencyTotals(dayLogs, projects),
    weeklyEarningsByCurrency: calculateCurrencyTotals(weeklyLogs, projects),
    monthlyEarningsByCurrency: calculateCurrencyTotals(monthlyLogs, projects),
  };
}
