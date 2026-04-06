import type { CurrencyCode } from './app';

export type ContractType = 'hourly' | 'temporary' | 'part-time' | 'full-time' | 'freelance';
export type WeekdayEstimationKey =
  | 'monHours'
  | 'tueHours'
  | 'wedHours'
  | 'thuHours'
  | 'friHours'
  | 'satHours'
  | 'sunHours';

export type WeeklyEstimation = Record<WeekdayEstimationKey, number>;
export const PROJECT_COLOR_OPTIONS = ['#EF4444', '#F97316', '#10B981', '#14B8A6', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899'] as const;
export type ProjectColor = (typeof PROJECT_COLOR_OPTIONS)[number];
export type PaymentType = 'one_time' | 'monthly_fixed_day' | 'weekly' | 'biweekly';
export type PaymentWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type OneTimePaymentRule = {
  type: 'one_time';
  paymentDate: string;
};

export type MonthlyFixedDayPaymentRule = {
  type: 'monthly_fixed_day';
  paymentDayOfMonth: number;
};

export type WeeklyPaymentRule = {
  type: 'weekly';
  paymentWeekday: PaymentWeekday;
};

export type BiweeklyPaymentRule = {
  type: 'biweekly';
  paymentStartDate: string;
  paymentWeekday?: PaymentWeekday;
};

export type PaymentRule =
  | OneTimePaymentRule
  | MonthlyFixedDayPaymentRule
  | WeeklyPaymentRule
  | BiweeklyPaymentRule;

export type ContractFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export type Project = {
  id: string;
  name: string;
  hourlyRate: number;
  currency: CurrencyCode;
  contractType: ContractType;
  startDate: string;
  color?: ProjectColor | null;
  paymentRule?: PaymentRule;
  weeklyEstimation?: WeeklyEstimation;
  contractFile?: ContractFile;
};

export type CreateProjectInput = {
  name: string;
  hourlyRate: number;
  currency: CurrencyCode;
  contractType: ContractType;
  startDate: string;
  color?: ProjectColor | null;
  paymentRule?: PaymentRule;
  weeklyEstimation?: WeeklyEstimation;
  contractFile?: ContractFile;
};

export type UpdateProjectInput = Partial<Omit<Project, 'id'>>;
