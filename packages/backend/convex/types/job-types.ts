// Plain TypeScript types to replace Zod schemas
export interface MinimalLinkedInJob {
  id: string;
  title: string;
  link: string;
  companyName?: string;
  descriptionHtml?: string;
  descriptionText?: string;
  location?: string;
  salaryInfo?: string[];
  postedAt?: string;
}

export interface MinimalIndeedJob {
  positionName: string;
  url: string;
  company: string;
  salary?: string;
  jobType?: string[];
  location?: string;
  companyInfo?: {
    companyLogo?: string;
    companyDescription?: string;
  };
}

export interface CrawledJobs {
  source: "linkedIn" | "indeed";
  jobs: (MinimalLinkedInJob | MinimalIndeedJob)[];
}

export interface CVProfile {
  skills: string[];
  experience_level: "entry" | "mid" | "senior" | "executive";
  job_titles: string[];
  industries: string[];
  keywords: string[];
  education: string;
  years_of_experience: number;
  preferred_locations: string[];
}

export interface JobRanking {
  ranked_jobs: Array<{
    id: string;
    match_reasons: string[];
    concerns: string[];
  }>;
  insights: {
    total_relevant: number;
    avg_match_score: number;
    top_skills_in_demand: string[];
    salary_insights: string;
    market_observations: string;
  };
}

export interface BatchJobAnalysis {
  jobAnalyses: Array<{
    jobId: string;
    experienceMatch: {
      match_level: "perfect" | "good" | "partial" | "poor" | "mismatch";
      match_score: number;
      match_reasons: string[];
      experience_gaps: string[];
      recommendation: string;
    };
    locationMatch: {
      match_score: number;
      match_reasons: string[];
    };
  }>;
}

export interface KeywordExtraction {
  primary_keywords: string[];
  secondary_keywords: string[];
  search_terms: string[];
  job_title_keywords: string[];
  technical_skills: string[];
  soft_skills: string[];
  industry_terms: string[];
  location_keywords: string[];
  company_type_keywords: string[];
  experience_level_keywords: string[];
  education_keywords: string[];
  certification_keywords: string[];
  salary_keywords: string[];
  benefit_keywords: string[];
  work_arrangement_keywords: string[];
}