import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { translate } from '@/i18n';
import { STORAGE_KEYS } from '@/constants';
import { PROJECT_COLOR_OPTIONS } from '@/types';
import type {
  AppLanguage,
  CreateProjectInput,
  CreateWorkLogInput,
  PaymentRule,
  PaymentWeekday,
  ProjectColor,
  Project,
  SummaryDisplayMode,
  SummaryDisplayPreferences,
  SummaryMetricKey,
  SummaryDisplayPreset,
  ThemeMode,
  UpdateProjectInput,
  UpdateWorkLogInput,
  WeeklyEstimation,
  WeekStart,
  WorkLog,
} from '@/types';

export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export type AppToast = {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
};

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
  summaryDisplayPreset: SummaryDisplayPreset;
  setSummaryDisplayPreset: (value: SummaryDisplayPreset) => void;
  summaryDisplayPreferences: SummaryDisplayPreferences;
  setSummaryDisplayPreference: (key: SummaryMetricKey, value: SummaryDisplayMode) => void;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  projects: Project[];
  workLogs: WorkLog[];
  holidayDates: string[];
  activeToast: AppToast | null;
  showToast: (toast: Omit<AppToast, 'id'>) => void;
  dismissToast: () => void;
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
const DEFAULT_SUMMARY_DISPLAY_PREFERENCES: SummaryDisplayPreferences = {
  today: 'hours',
  week: 'hours',
  month: 'hours',
  projection: 'hours',
};
const DEFAULT_SUMMARY_DISPLAY_PRESET: SummaryDisplayPreset = 'hours';
type StoredProject = Partial<Project> & {
  payday?: string;
};

function roundToTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}

function normalizeWeeklyEstimation(weeklyEstimation?: Partial<WeeklyEstimation>) {
  if (!weeklyEstimation) {
    return undefined;
  }

  const normalizedValue: WeeklyEstimation = {
    monHours: Number(weeklyEstimation.monHours ?? 0),
    tueHours: Number(weeklyEstimation.tueHours ?? 0),
    wedHours: Number(weeklyEstimation.wedHours ?? 0),
    thuHours: Number(weeklyEstimation.thuHours ?? 0),
    friHours: Number(weeklyEstimation.friHours ?? 0),
    satHours: Number(weeklyEstimation.satHours ?? 0),
    sunHours: Number(weeklyEstimation.sunHours ?? 0),
  };

  return Object.values(normalizedValue).some((value) => value > 0) ? normalizedValue : undefined;
}

function isValidDateKey(value?: string): value is string {
  return Boolean(value?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()));
}

function normalizePaymentWeekday(value: unknown): PaymentWeekday | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 6) {
    return undefined;
  }

  return value as PaymentWeekday;
}

function normalizeProjectColor(value?: string | null): ProjectColor | null {
  if (!value) {
    return null;
  }

  return PROJECT_COLOR_OPTIONS.includes(value as ProjectColor) ? (value as ProjectColor) : null;
}

function normalizePaymentRule(
  paymentRule?: Partial<PaymentRule> | null,
  legacyPayday?: string,
  fallbackDate?: string,
): PaymentRule | undefined {
  if (paymentRule?.type === 'one_time' && isValidDateKey(paymentRule.paymentDate)) {
    const paymentDate = paymentRule.paymentDate.trim();

    return {
      type: 'one_time',
      paymentDate,
    };
  }

  if (paymentRule?.type === 'monthly_fixed_day') {
    const paymentDayOfMonth = Number(paymentRule.paymentDayOfMonth);

    if (Number.isInteger(paymentDayOfMonth) && paymentDayOfMonth >= 1 && paymentDayOfMonth <= 31) {
      return {
        type: 'monthly_fixed_day',
        paymentDayOfMonth,
      };
    }
  }

  if (paymentRule?.type === 'weekly') {
    const paymentWeekday = normalizePaymentWeekday(paymentRule.paymentWeekday);

    if (paymentWeekday !== undefined) {
      return {
        type: 'weekly',
        paymentWeekday,
      };
    }
  }

  if (paymentRule?.type === 'biweekly' && isValidDateKey(paymentRule.paymentStartDate)) {
    const paymentStartDate = paymentRule.paymentStartDate.trim();

    return {
      type: 'biweekly',
      paymentStartDate,
      paymentWeekday: normalizePaymentWeekday(paymentRule.paymentWeekday),
    };
  }

  if (isValidDateKey(legacyPayday)) {
    const paymentDate = legacyPayday.trim();

    return {
      type: 'one_time',
      paymentDate,
    };
  }

  if (isValidDateKey(fallbackDate)) {
    const paymentDate = fallbackDate.trim();

    return {
      type: 'one_time',
      paymentDate,
    };
  }

  return undefined;
}

function normalizeProject(project: StoredProject): Project {
  const normalizedStartDate = project.startDate?.trim() ?? '';

  return {
    id: project.id ?? createId('project'),
    name: project.name?.trim() ?? '',
    hourlyRate: Number(project.hourlyRate ?? 0),
    currency: project.currency === 'USD' ? 'USD' : DEFAULT_PROJECT_CURRENCY,
    contractType: project.contractType ?? 'hourly',
    startDate: normalizedStartDate,
    color: normalizeProjectColor(project.color),
    paymentRule: normalizePaymentRule(project.paymentRule, project.payday, normalizedStartDate),
    weeklyEstimation: normalizeWeeklyEstimation(project.weeklyEstimation),
    contractFile: project.contractFile,
  };
}

function normalizeSummaryDisplayPreferences(
  preferences?: Partial<Record<SummaryMetricKey, SummaryDisplayMode>>,
): SummaryDisplayPreferences {
  return {
    today: preferences?.today === 'earnings' ? 'earnings' : 'hours',
    week: preferences?.week === 'earnings' ? 'earnings' : 'hours',
    month: preferences?.month === 'earnings' ? 'earnings' : 'hours',
    projection: preferences?.projection === 'earnings' ? 'earnings' : 'hours',
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isHeaderCompact, setHeaderCompact] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [weekStart, setWeekStart] = useState<WeekStart>('monday');
  const [summaryDisplayPreset, setSummaryDisplayPreset] = useState<SummaryDisplayPreset>(DEFAULT_SUMMARY_DISPLAY_PRESET);
  const [summaryDisplayPreferences, setSummaryDisplayPreferences] = useState<SummaryDisplayPreferences>(
    DEFAULT_SUMMARY_DISPLAY_PREFERENCES,
  );
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [holidayDates, setHolidayDates] = useState<string[]>(initialHolidayDates);
  const [activeToast, setActiveToast] = useState<AppToast | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [
          storedThemeMode,
          storedLanguage,
          storedWeekStart,
          storedSummaryDisplayPreset,
          storedSummaryDisplayPreferences,
          storedProjects,
          storedWorkLogs,
          storedHolidayDates,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.themeMode),
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.weekStart),
          AsyncStorage.getItem(STORAGE_KEYS.summaryDisplayPreset),
          AsyncStorage.getItem(STORAGE_KEYS.summaryDisplayPreferences),
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

        if (storedSummaryDisplayPreset === 'hours' || storedSummaryDisplayPreset === 'earnings' || storedSummaryDisplayPreset === 'custom') {
          setSummaryDisplayPreset(storedSummaryDisplayPreset);
        }

        if (storedSummaryDisplayPreferences) {
          setSummaryDisplayPreferences(
            normalizeSummaryDisplayPreferences(
              JSON.parse(storedSummaryDisplayPreferences) as Partial<Record<SummaryMetricKey, SummaryDisplayMode>>,
            ),
          );
        }

        if (storedProjects) {
          setProjects((JSON.parse(storedProjects) as StoredProject[]).map(normalizeProject));
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

    void AsyncStorage.setItem(STORAGE_KEYS.summaryDisplayPreset, summaryDisplayPreset);
  }, [isHydrated, summaryDisplayPreset]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEYS.summaryDisplayPreferences, JSON.stringify(summaryDisplayPreferences));
  }, [isHydrated, summaryDisplayPreferences]);

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
  const showToast = useCallback((toast: Omit<AppToast, 'id'>) => {
    setActiveToast({
      id: Date.now(),
      ...toast,
    });
  }, []);
  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

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
      summaryDisplayPreset,
      setSummaryDisplayPreset,
      summaryDisplayPreferences,
      setSummaryDisplayPreference: (key, value) => {
        setSummaryDisplayPreferences((currentPreferences) => ({
          ...currentPreferences,
          [key]: value,
        }));
      },
      locale,
      t: (key, params) => translate(language, key, params),
      projects,
      workLogs,
      holidayDates,
      activeToast,
      showToast,
      dismissToast,
      toggleHoliday: (date) => {
        setHolidayDates((currentDates) =>
          currentDates.includes(date)
            ? currentDates.filter((currentDate) => currentDate !== date)
            : [...currentDates, date],
        );
      },
      createProject: ({ name, hourlyRate, currency, contractType, startDate, color, paymentRule, weeklyEstimation, contractFile }) => {
        const normalizedName = name.trim();
        const normalizedStartDate = startDate.trim();
        const normalizedColor = normalizeProjectColor(color);
        const normalizedPaymentRule = normalizePaymentRule(paymentRule, undefined, normalizedStartDate);

        if (!normalizedName || hourlyRate <= 0 || !normalizedStartDate || !normalizedPaymentRule) {
          return null;
        }

        const newProject: Project = {
          id: createId('project'),
          name: normalizedName,
          hourlyRate: roundToTwoDecimals(hourlyRate),
          currency,
          contractType,
          startDate: normalizedStartDate,
          color: normalizedColor,
          paymentRule: normalizedPaymentRule,
          weeklyEstimation: normalizeWeeklyEstimation(weeklyEstimation),
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

            const nextStartDate = updates.startDate?.trim() || project.startDate;
            const normalizedPaymentRule =
              updates.paymentRule === undefined
                ? project.paymentRule
                : normalizePaymentRule(updates.paymentRule, undefined, nextStartDate) ?? project.paymentRule;

            return {
              ...project,
              ...updates,
              hourlyRate:
                typeof updates.hourlyRate === 'number'
                  ? roundToTwoDecimals(updates.hourlyRate)
                  : project.hourlyRate,
              currency: updates.currency ?? project.currency,
              startDate: nextStartDate,
              color: updates.color === undefined ? project.color : normalizeProjectColor(updates.color),
              paymentRule: normalizedPaymentRule,
              name: updates.name?.trim() || project.name,
              weeklyEstimation:
                updates.weeklyEstimation === undefined
                  ? project.weeklyEstimation
                  : normalizeWeeklyEstimation(updates.weeklyEstimation),
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
            hoursWorked: roundToTwoDecimals(hoursWorked),
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
                  ? roundToTwoDecimals(updates.hoursWorked)
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
    [
      holidayDates,
      activeToast,
      dismissToast,
      isHeaderCompact,
      isHydrated,
      language,
      locale,
      projects,
      showToast,
      summaryDisplayPreset,
      summaryDisplayPreferences,
      themeMode,
      weekStart,
      workLogs,
    ],
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
