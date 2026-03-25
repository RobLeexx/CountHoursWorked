import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import type {
  CreateProjectInput,
  CreateWorkLogInput,
  Project,
  ThemeMode,
  UpdateWorkLogInput,
  WorkLog,
} from '@/types';

type AppContextValue = {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  projects: Project[];
  workLogs: WorkLog[];
  createProject: (input: CreateProjectInput) => Project | null;
  addWorkLog: (input: CreateWorkLogInput) => void;
  updateWorkLog: (id: string, updates: UpdateWorkLogInput) => void;
  deleteWorkLog: (id: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const initialProjects: Project[] = [];

const initialWorkLogs: WorkLog[] = [];

export function AppProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);

  const value: AppContextValue = {
    themeMode,
    toggleThemeMode: () => {
      setThemeMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
    },
    projects,
    workLogs,
    createProject: ({ name, hourlyRate }) => {
      const normalizedName = name.trim();

      if (!normalizedName || hourlyRate <= 0) {
        return null;
      }

      const newProject: Project = {
        id: createId('project'),
        name: normalizedName,
        hourlyRate: Number(hourlyRate.toFixed(2)),
      };

      setProjects((currentProjects) => [...currentProjects, newProject]);

      return newProject;
    },
    addWorkLog: ({ date, hoursWorked, projectId }) => {
      if (!date || !projectId || hoursWorked <= 0) {
        return;
      }

      setWorkLogs((currentLogs) => [
        ...currentLogs,
        {
          id: createId('log'),
          date,
          hoursWorked: Number(hoursWorked.toFixed(2)),
          projectId,
        },
      ]);
    },
    updateWorkLog: (id, updates) => {
      setWorkLogs((currentLogs) =>
        currentLogs.map((log) => {
          if (log.id !== id) {
            return log;
          }

          return {
            ...log,
            ...updates,
            hoursWorked:
              typeof updates.hoursWorked === 'number'
                ? Number(updates.hoursWorked.toFixed(2))
                : log.hoursWorked,
          };
        }),
      );
    },
    deleteWorkLog: (id) => {
      setWorkLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
