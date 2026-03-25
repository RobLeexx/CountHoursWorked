export type Project = {
  id: string;
  name: string;
  hourlyRate: number;
};

export type CreateProjectInput = {
  name: string;
  hourlyRate: number;
};
