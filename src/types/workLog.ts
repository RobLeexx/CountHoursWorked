export type WorkLog = {
  id: string;
  date: string;
  hoursWorked: number;
  projectId: string;
};

export type CreateWorkLogInput = Omit<WorkLog, 'id'>;

export type UpdateWorkLogInput = Partial<Omit<WorkLog, 'id'>>;

