// Plain TypeScript types to replace Zod schemas
export interface MinimalLinkedInJob {
  id: string;
  title: string;
  link: string;
  companyName: string;
  descriptionHtml: string;
  descriptionText: string;
  location?: string;
  salaryInfo?: string[];
  postedAt?: string;
  // Additional fields from LinkedIn crawler output
  trackingId?: string;
  refId?: string;
  companyLinkedinUrl?: string;
  companyLogo?: string;
  benefits?: string[];
  applicantsCount?: string;
  applyUrl?: string;
  jobPosterName?: string;
  jobPosterTitle?: string;
  jobPosterPhoto?: string;
  jobPosterProfileUrl?: string;
  seniorityLevel?: string;
  employmentType?: string;
  jobFunction?: string;
  industries?: string;
  inputUrl?: string;
  companyEmployeesCount?: number;
  companyDescription?: string;
  companyAddress?: {
    type: string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  companyWebsite?: string;
  companySlogan?: string;
}

export interface MinimalIndeedJob {
  positionName: string;
  url: string;
  company: string;
  location: string;  // Required in crawler output
  salary?: string | null;
  jobType?: string[];
  rating?: number | null;
  reviewsCount?: number | null;
  companyInfo?: {
    companyLogo?: string | null;
    companyDescription?: string | null;
    indeedUrl?: string;
    url?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    companySize?: {
      min: number | null;
      max: number | null;
    } | null;
  };
}

export interface CrawledJobs {
  source: "linkedIn" | "linked-in" | "indeed";
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
      work_type_match: string;
    };
    benefits: Array<{
      description: string;
      details?: string;
    }>;
    requirements: Array<{
      description: string;
      details?: string;
    }>;
    dataExtraction: {
      salary: {
        is_salary_mentioned: boolean;
        min: number | null;
        max: number | null;
        currency: string;
      };
      company: {
        is_company_mentioned: boolean;
        name: string | null;
      };
      job_type: {
        type: string;
      };
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