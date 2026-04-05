import { useAppContext } from '@/context';
import {
  calculateCurrencyTotals,
  calculateHoursTotal,
  getLogsForDate,
  getLogsForMonth,
  getLogsForWeek,
  toDateKey,
} from '@/utils';

export function useWorkLogs(selectedDateInput?: string | Date) {
  const { workLogs, projects, addWorkLog, updateWorkLog, deleteWorkLog, weekStart } = useAppContext();
  const selectedDate = selectedDateInput
    ? typeof selectedDateInput === 'string'
      ? selectedDateInput
      : toDateKey(selectedDateInput)
    : toDateKey(new Date());

  const dayLogs = getLogsForDate(workLogs, selectedDate);
  const weeklyLogs = getLogsForWeek(workLogs, selectedDate, weekStart);
  const monthlyLogs = getLogsForMonth(workLogs, selectedDate);
  const getLogForProject = (projectId: string) => dayLogs.find((log) => log.projectId === projectId);

  return {
    workLogs,
    dayLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    getLogForProject,
    setHoursForProject: (projectId: string, hoursWorked: number) => {
      const existingLog = getLogForProject(projectId);

      if (existingLog) {
        updateWorkLog(existingLog.id, { hoursWorked });
        return;
      }

      addWorkLog({ date: selectedDate, projectId, hoursWorked });
    },
    clearHoursForProject: (projectId: string) => {
      const existingLog = getLogForProject(projectId);

      if (existingLog) {
        deleteWorkLog(existingLog.id);
      }
    },
    dailyHours: calculateHoursTotal(dayLogs),
    weeklyHours: calculateHoursTotal(weeklyLogs),
    monthlyHours: calculateHoursTotal(monthlyLogs),
    dailyEarningsByCurrency: calculateCurrencyTotals(dayLogs, projects),
    weeklyEarningsByCurrency: calculateCurrencyTotals(weeklyLogs, projects),
    monthlyEarningsByCurrency: calculateCurrencyTotals(monthlyLogs, projects),
  };
}
