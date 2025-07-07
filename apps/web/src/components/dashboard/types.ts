export * from '@qaddam/backend/convex/types/jobs'

export type StepStatus = 'not_started' | 'pending' | 'finished';
export type DashboardStage = 'upload' | 'workflow' | 'results';

export interface Step {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
}
