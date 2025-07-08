export type JobType = "full_time" | "part_time" | "contract" | "remote";

export type JobResult = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: JobType;
  remote: boolean;
  url: string;
  postedDate: string;
  matchScore: number;
  
  // AI Analysis fields
  benefits: string[];
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  locationMatch: string;
};

export type JobSearchResults = {
  jobs: JobResult[];
  totalFound: number;
  insights: {
    total_relevant: number;
    avg_match_score: number;
    top_skills_in_demand: string[];
    salary_insights: string;
    market_observations: string;
  };
  searchParams: {
    optimized_keywords: string[];
    target_job_titles: string[];
    target_companies: string[];
    salary_range: {
      min: number;
      max: number;
      currency: string;
    };
    preferred_job_types: string[];
    locations: string[];
    search_strategy: string;
  };
};
