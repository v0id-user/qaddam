// Lightweight validation functions to replace Zod schemas
import type { 
  MinimalLinkedInJob, 
  MinimalIndeedJob, 
  CrawledJobs, 
  CVProfile, 
  JobRanking, 
  BatchJobAnalysis, 
  KeywordExtraction 
} from "../types/job-types";

// Type guards for job validation
export const isLinkedInJob = (obj: any): obj is MinimalLinkedInJob => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.link === "string" &&
    (obj.companyName === undefined || typeof obj.companyName === "string") &&
    (obj.descriptionHtml === undefined || typeof obj.descriptionHtml === "string") &&
    (obj.descriptionText === undefined || typeof obj.descriptionText === "string") &&
    (obj.location === undefined || typeof obj.location === "string") &&
    (obj.salaryInfo === undefined || Array.isArray(obj.salaryInfo)) &&
    (obj.postedAt === undefined || typeof obj.postedAt === "string")
  );
};

export const isIndeedJob = (obj: any): obj is MinimalIndeedJob => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.positionName === "string" &&
    typeof obj.url === "string" &&
    typeof obj.company === "string" &&
    (obj.salary === undefined || typeof obj.salary === "string") &&
    (obj.jobType === undefined || Array.isArray(obj.jobType)) &&
    (obj.location === undefined || typeof obj.location === "string") &&
    (obj.companyInfo === undefined || (
      typeof obj.companyInfo === "object" &&
      obj.companyInfo !== null &&
      (obj.companyInfo.companyLogo === undefined || typeof obj.companyInfo.companyLogo === "string") &&
      (obj.companyInfo.companyDescription === undefined || typeof obj.companyInfo.companyDescription === "string")
    ))
  );
};

export const isCrawledJobs = (obj: any): obj is CrawledJobs => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj.source === "linkedIn" || obj.source === "indeed") &&
    Array.isArray(obj.jobs) &&
    obj.jobs.every((job: any) => 
      obj.source === "linkedIn" ? isLinkedInJob(job) : isIndeedJob(job)
    )
  );
};

export const validateCrawledJobsArray = (data: any): CrawledJobs[] => {
  if (!Array.isArray(data)) {
    throw new Error("Expected array of crawled jobs");
  }
  
  const validatedJobs: CrawledJobs[] = [];
  
  for (const item of data) {
    if (isCrawledJobs(item)) {
      validatedJobs.push(item);
    } else {
      throw new Error(`Invalid crawled jobs data: ${JSON.stringify(item).slice(0, 100)}...`);
    }
  }
  
  return validatedJobs;
};

export const validateCVProfile = (data: any): CVProfile => {
  if (typeof data !== "object" || data === null) {
    throw new Error("CV profile must be an object");
  }
  
  const profile: CVProfile = {
    skills: Array.isArray(data.skills) ? data.skills.filter(s => typeof s === "string") : [],
    experience_level: ["entry", "mid", "senior", "executive"].includes(data.experience_level) 
      ? data.experience_level : "entry",
    job_titles: Array.isArray(data.job_titles) ? data.job_titles.filter(t => typeof t === "string") : [],
    industries: Array.isArray(data.industries) ? data.industries.filter(i => typeof i === "string") : [],
    keywords: Array.isArray(data.keywords) ? data.keywords.filter(k => typeof k === "string") : [],
    education: typeof data.education === "string" ? data.education : "",
    years_of_experience: typeof data.years_of_experience === "number" ? Math.max(0, data.years_of_experience) : 0,
    preferred_locations: Array.isArray(data.preferred_locations) ? data.preferred_locations.filter(l => typeof l === "string") : [],
  };
  
  // Basic validation
  if (profile.skills.length === 0) {
    throw new Error("CV profile must have at least one skill");
  }
  if (profile.job_titles.length === 0) {
    throw new Error("CV profile must have at least one job title");
  }
  if (profile.industries.length === 0) {
    throw new Error("CV profile must have at least one industry");
  }
  if (profile.keywords.length === 0) {
    throw new Error("CV profile must have at least one keyword");
  }
  if (profile.education.length === 0) {
    throw new Error("CV profile must have education information");
  }
  if (profile.preferred_locations.length === 0) {
    throw new Error("CV profile must have at least one preferred location");
  }
  
  return profile;
};

export const validateJobRanking = (data: any): JobRanking => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Job ranking must be an object");
  }
  
  const ranking: JobRanking = {
    ranked_jobs: Array.isArray(data.ranked_jobs) 
      ? data.ranked_jobs.filter(job => 
          typeof job === "object" && 
          job !== null && 
          typeof job.id === "string" &&
          Array.isArray(job.match_reasons) &&
          Array.isArray(job.concerns)
        ).map(job => ({
          id: job.id,
          match_reasons: job.match_reasons.filter((r: any) => typeof r === "string"),
          concerns: job.concerns.filter((c: any) => typeof c === "string")
        }))
      : [],
    insights: {
      total_relevant: typeof data.insights?.total_relevant === "number" ? data.insights.total_relevant : 0,
      avg_match_score: typeof data.insights?.avg_match_score === "number" ? data.insights.avg_match_score : 0,
      top_skills_in_demand: Array.isArray(data.insights?.top_skills_in_demand) 
        ? data.insights.top_skills_in_demand.filter((s: any) => typeof s === "string")
        : [],
      salary_insights: typeof data.insights?.salary_insights === "string" ? data.insights.salary_insights : "",
      market_observations: typeof data.insights?.market_observations === "string" ? data.insights.market_observations : "",
    }
  };
  
  return ranking;
};

export const validateBatchJobAnalysis = (data: any): BatchJobAnalysis => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Batch job analysis must be an object");
  }
  
  const analysis: BatchJobAnalysis = {
    jobAnalyses: Array.isArray(data.jobAnalyses)
      ? data.jobAnalyses.filter(job => 
          typeof job === "object" && 
          job !== null && 
          typeof job.jobId === "string" &&
          typeof job.experienceMatch === "object" &&
          typeof job.locationMatch === "object"
        ).map(job => ({
          jobId: job.jobId,
          experienceMatch: {
            match_level: ["perfect", "good", "partial", "poor", "mismatch"].includes(job.experienceMatch?.match_level)
              ? job.experienceMatch.match_level : "poor",
            match_score: typeof job.experienceMatch?.match_score === "number" 
              ? Math.max(0, Math.min(1, job.experienceMatch.match_score)) : 0,
            match_reasons: Array.isArray(job.experienceMatch?.match_reasons) 
              ? job.experienceMatch.match_reasons.filter((r: any) => typeof r === "string")
              : [],
            experience_gaps: Array.isArray(job.experienceMatch?.experience_gaps)
              ? job.experienceMatch.experience_gaps.filter((g: any) => typeof g === "string")
              : [],
            recommendation: typeof job.experienceMatch?.recommendation === "string" 
              ? job.experienceMatch.recommendation : ""
          },
          locationMatch: {
            match_score: typeof job.locationMatch?.match_score === "number"
              ? Math.max(0, Math.min(1, job.locationMatch.match_score)) : 0,
            match_reasons: Array.isArray(job.locationMatch?.match_reasons)
              ? job.locationMatch.match_reasons.filter((r: any) => typeof r === "string")
              : []
          }
        }))
      : []
  };
  
  return analysis;
};

export const validateKeywordExtraction = (data: any): KeywordExtraction => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Keyword extraction must be an object");
  }
  
  const extraction: KeywordExtraction = {
    primary_keywords: Array.isArray(data.primary_keywords) 
      ? data.primary_keywords.filter((k: any) => typeof k === "string") : [],
    secondary_keywords: Array.isArray(data.secondary_keywords) 
      ? data.secondary_keywords.filter((k: any) => typeof k === "string") : [],
    search_terms: Array.isArray(data.search_terms) 
      ? data.search_terms.filter((t: any) => typeof t === "string") : [],
    job_title_keywords: Array.isArray(data.job_title_keywords) 
      ? data.job_title_keywords.filter((k: any) => typeof k === "string") : [],
    technical_skills: Array.isArray(data.technical_skills) 
      ? data.technical_skills.filter((s: any) => typeof s === "string") : [],
    soft_skills: Array.isArray(data.soft_skills) 
      ? data.soft_skills.filter((s: any) => typeof s === "string") : [],
    industry_terms: Array.isArray(data.industry_terms) 
      ? data.industry_terms.filter((t: any) => typeof t === "string") : [],
    location_keywords: Array.isArray(data.location_keywords) 
      ? data.location_keywords.filter((k: any) => typeof k === "string") : [],
    company_type_keywords: Array.isArray(data.company_type_keywords) 
      ? data.company_type_keywords.filter((k: any) => typeof k === "string") : [],
    experience_level_keywords: Array.isArray(data.experience_level_keywords) 
      ? data.experience_level_keywords.filter((k: any) => typeof k === "string") : [],
    education_keywords: Array.isArray(data.education_keywords) 
      ? data.education_keywords.filter((k: any) => typeof k === "string") : [],
    certification_keywords: Array.isArray(data.certification_keywords) 
      ? data.certification_keywords.filter((k: any) => typeof k === "string") : [],
    salary_keywords: Array.isArray(data.salary_keywords) 
      ? data.salary_keywords.filter((k: any) => typeof k === "string") : [],
    benefit_keywords: Array.isArray(data.benefit_keywords) 
      ? data.benefit_keywords.filter((k: any) => typeof k === "string") : [],
    work_arrangement_keywords: Array.isArray(data.work_arrangement_keywords) 
      ? data.work_arrangement_keywords.filter((k: any) => typeof k === "string") : [],
  };
  
  return extraction;
};