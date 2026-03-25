import type { Project, WorkLog } from '@/types';

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
