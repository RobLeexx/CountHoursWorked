import { useAppContext } from '@/context';
import {
  calculateDailyEarnings,
  calculateHoursTotal,
  calculateMonthlyTotal,
  calculateWeeklyTotal,
  getLogsForDate,
  getLogsForMonth,
  getLogsForWeek,
  toDateKey,
} from '@/utils';

export function useWorkLogs(selectedDateInput?: string | Date) {
  const { workLogs, projects, addWorkLog, updateWorkLog, deleteWorkLog } = useAppContext();
  const selectedDate = selectedDateInput
    ? typeof selectedDateInput === 'string'
      ? selectedDateInput
      : toDateKey(selectedDateInput)
    : toDateKey(new Date());

  const dayLogs = getLogsForDate(workLogs, selectedDate);
  const weeklyLogs = getLogsForWeek(workLogs, selectedDate);
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
    dailyEarnings: dayLogs.reduce((total, log) => {
      const project = projects.find((item) => item.id === log.projectId);
      return total + calculateDailyEarnings(log, project);
    }, 0),
    weeklyEarnings: calculateWeeklyTotal(weeklyLogs, projects),
    monthlyEarnings: calculateMonthlyTotal(monthlyLogs, projects),
  };
}
