import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { translate } from '@/i18n';
import { STORAGE_KEYS } from '@/constants';
import type {
  AppLanguage,
  CreateProjectInput,
  CreateWorkLogInput,
  Project,
  ThemeMode,
  UpdateProjectInput,
  UpdateWorkLogInput,
  WeekStart,
  WorkLog,
} from '@/types';

type AppContextValue = {
  isHydrated: boolean;
  isHeaderCompact: boolean;
  setHeaderCompact: (value: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
  toggleThemeMode: () => void;
  language: AppLanguage;
  setLanguage: (value: AppLanguage) => void;
  weekStart: WeekStart;
  setWeekStart: (value: WeekStart) => void;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  projects: Project[];
  workLogs: WorkLog[];
  holidayDates: string[];
  toggleHoliday: (date: string) => void;
  createProject: (input: CreateProjectInput) => Project | null;
  updateProject: (id: string, updates: UpdateProjectInput) => void;
  deleteProject: (id: string) => void;
  addWorkLog: (input: CreateWorkLogInput) => void;
  updateWorkLog: (id: string, updates: UpdateWorkLogInput) => void;
  deleteWorkLog: (id: string) => void;
  resetData: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const initialProjects: Project[] = [];
const initialWorkLogs: WorkLog[] = [];
const initialHolidayDates: string[] = [];
const DEFAULT_PROJECT_CURRENCY = 'EUR';

function normalizeProject(project: Partial<Project>): Project {
  return {
    id: project.id ?? createId('project'),
    name: project.name?.trim() ?? '',
    hourlyRate: Number(project.hourlyRate ?? 0),
    currency: project.currency === 'USD' ? 'USD' : DEFAULT_PROJECT_CURRENCY,
    contractType: project.contractType ?? 'hourly',
    startDate: project.startDate?.trim() ?? '',
    contractFile: project.contractFile,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isHeaderCompact, setHeaderCompact] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [weekStart, setWeekStart] = useState<WeekStart>('monday');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [holidayDates, setHolidayDates] = useState<string[]>(initialHolidayDates);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [
          storedThemeMode,
          storedLanguage,
          storedWeekStart,
          storedProjects,
          storedWorkLogs,
          storedHolidayDates,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.themeMode),
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.weekStart),
          AsyncStorage.getItem(STORAGE_KEYS.projects),
          AsyncStorage.getItem(STORAGE_KEYS.workLogs),
          AsyncStorage.getItem(STORAGE_KEYS.holidayDates),
        ]);

        if (storedThemeMode === 'light' || storedThemeMode === 'dark') {
          setThemeMode(storedThemeMode);
        }

        if (storedLanguage === 'en' || storedLanguage === 'es') {
          setLanguage(storedLanguage);
        }

        if (storedWeekStart === 'monday' || storedWeekStart === 'sunday') {
          setWeekStart(storedWeekStart);
        }

        if (storedProjects) {
          setProjects((JSON.parse(storedProjects) as Partial<Project>[]).map(normalizeProject));
        }

        if (storedWorkLogs) {
          setWorkLogs(JSON.parse(storedWorkLogs) as WorkLog[]);
        }

        if (storedHolidayDates) {
          setHolidayDates(JSON.parse(storedHolidayDates) as string[]);
        }
      } catch (error) {
        console.warn('Failed to hydrate app storage.', error);
      } finally {
        setIsHydrated(true);
      }
    };

    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.themeMode, themeMode);
  }, [isHydrated, themeMode]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.language, language);
  }, [isHydrated, language]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.weekStart, weekStart);
  }, [isHydrated, weekStart]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }, [isHydrated, projects]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.workLogs, JSON.stringify(workLogs));
  }, [isHydrated, workLogs]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.holidayDates, JSON.stringify(holidayDates));
  }, [holidayDates, isHydrated]);

  const locale = language === 'es' ? 'es-ES' : 'en-IE';

  const value = useMemo<AppContextValue>(
    () => ({
      isHydrated,
      isHeaderCompact,
      setHeaderCompact,
      themeMode,
      setThemeMode,
      toggleThemeMode: () => {
        setThemeMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
      },
      language,
      setLanguage,
      weekStart,
      setWeekStart,
      locale,
      t: (key, params) => translate(language, key, params),
      projects,
      workLogs,
      holidayDates,
      toggleHoliday: (date) => {
        setHolidayDates((currentDates) =>
          currentDates.includes(date)
            ? currentDates.filter((currentDate) => currentDate !== date)
            : [...currentDates, date],
        );
      },
      createProject: ({ name, hourlyRate, currency, contractType, startDate, contractFile }) => {
        const normalizedName = name.trim();
        const normalizedStartDate = startDate.trim();

        if (!normalizedName || hourlyRate <= 0 || !normalizedStartDate) {
          return null;
        }

        const newProject: Project = {
          id: createId('project'),
          name: normalizedName,
          hourlyRate: Number(hourlyRate.toFixed(2)),
          currency,
          contractType,
          startDate: normalizedStartDate,
          contractFile,
        };

        setProjects((currentProjects) => [...currentProjects, newProject]);

        return newProject;
      },
      updateProject: (id, updates) => {
        setProjects((currentProjects) =>
          currentProjects.map((project) => {
            if (project.id !== id) {
              return project;
            }

            return {
              ...project,
              ...updates,
              hourlyRate:
                typeof updates.hourlyRate === 'number'
                  ? Number(updates.hourlyRate.toFixed(2))
                  : project.hourlyRate,
              currency: updates.currency ?? project.currency,
              startDate: updates.startDate?.trim() || project.startDate,
              name: updates.name?.trim() || project.name,
            };
          }),
        );
      },
      deleteProject: (id) => {
        setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));
        setWorkLogs((currentLogs) => currentLogs.filter((log) => log.projectId !== id));
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
      resetData: () => {
        setProjects([]);
        setWorkLogs([]);
        setHolidayDates([]);
      },
    }),
    [holidayDates, isHeaderCompact, isHydrated, language, locale, projects, themeMode, weekStart, workLogs],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
