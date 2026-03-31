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
  weeklyEstimation?: WeeklyEstimation;
  contractFile?: ContractFile;
};

export type CreateProjectInput = {
  name: string;
  hourlyRate: number;
  currency: CurrencyCode;
  contractType: ContractType;
  startDate: string;
  weeklyEstimation?: WeeklyEstimation;
  contractFile?: ContractFile;
};

export type UpdateProjectInput = Partial<Omit<Project, 'id'>>;
