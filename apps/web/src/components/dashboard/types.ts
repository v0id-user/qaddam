export type StepStatus = 'not_started' | 'pending' | 'finished';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'remote';
export type DashboardStage = 'upload' | 'workflow' | 'results';

export interface Step {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary: string;
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  locationMatch: string;
} 