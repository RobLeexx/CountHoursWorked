export type ContractType = 'hourly' | 'temporary' | 'part-time' | 'full-time' | 'freelance';

export type ContractFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export type Project = {
  id: string;
  name: string;
  hourlyRate: number;
  contractType: ContractType;
  startDate: string;
  contractFile?: ContractFile;
};

export type CreateProjectInput = {
  name: string;
  hourlyRate: number;
  contractType: ContractType;
  startDate: string;
  contractFile?: ContractFile;
};

export type UpdateProjectInput = Partial<Omit<Project, 'id'>>;
