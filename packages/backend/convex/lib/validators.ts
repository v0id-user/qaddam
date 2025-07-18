// Lightweight validation functions to replace Zod schemas
import type { 
  MinimalLinkedInJob, 
  MinimalIndeedJob, 
  CrawledJobs, 
  CVProfile, 
  JobRanking, 
  BatchJobAnalysis, 
  KeywordExtraction 
} from "../types/job_types";

// Type guards for job validation
export const isLinkedInJob = (obj: unknown): obj is MinimalLinkedInJob => {
  if (typeof obj !== "object" || obj === null) return false;
  
  const record = obj as Record<string, unknown>;
  
  // Accept the actual structure returned by LinkedIn crawler
  // The crawler returns companyName, descriptionHtml, descriptionText as required fields
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.link === "string" &&
    typeof record.companyName === "string" &&
    typeof record.descriptionHtml === "string" &&
    typeof record.descriptionText === "string" &&
    (record.location === undefined || typeof record.location === "string") &&
    (record.salaryInfo === undefined || Array.isArray(record.salaryInfo)) &&
    (record.postedAt === undefined || typeof record.postedAt === "string")
  );
};

export const isIndeedJob = (obj: unknown): obj is MinimalIndeedJob => {
  if (typeof obj !== "object" || obj === null) return false;
  
  const record = obj as Record<string, unknown>;
  
  // Accept the actual structure returned by Indeed crawler
  return (
    typeof record.positionName === "string" &&
    typeof record.url === "string" &&
    typeof record.company === "string" &&
    typeof record.location === "string" &&
    (record.salary === null || typeof record.salary === "string") &&
    (record.jobType === undefined || Array.isArray(record.jobType)) &&
    (record.rating === null || typeof record.rating === "number") &&
    (record.reviewsCount === null || typeof record.reviewsCount === "number") &&
    (record.companyInfo === undefined || (
      typeof record.companyInfo === "object" &&
      record.companyInfo !== null &&
      ((record.companyInfo as Record<string, unknown>).companyLogo === null || typeof (record.companyInfo as Record<string, unknown>).companyLogo === "string") &&
      ((record.companyInfo as Record<string, unknown>).companyDescription === null || typeof (record.companyInfo as Record<string, unknown>).companyDescription === "string") &&
      ((record.companyInfo as Record<string, unknown>).indeedUrl === undefined || typeof (record.companyInfo as Record<string, unknown>).indeedUrl === "string") &&
      ((record.companyInfo as Record<string, unknown>).url === null || typeof (record.companyInfo as Record<string, unknown>).url === "string") &&
      ((record.companyInfo as Record<string, unknown>).rating === null || typeof (record.companyInfo as Record<string, unknown>).rating === "number") &&
      ((record.companyInfo as Record<string, unknown>).reviewCount === null || typeof (record.companyInfo as Record<string, unknown>).reviewCount === "number") &&
      ((record.companyInfo as Record<string, unknown>).companySize === null || typeof (record.companyInfo as Record<string, unknown>).companySize === "object")
    ))
  );
};

export const isCrawledJobs = (obj: unknown): obj is CrawledJobs => {
  if (typeof obj !== "object" || obj === null) return false;
  
  const record = obj as Record<string, unknown>;
  
  // Accept both "linked-in" (from crawler) and "linkedIn" (normalized form) as valid sources
  return (
    (record.source === "linkedIn" || record.source === "linked-in" || record.source === "indeed") &&
    Array.isArray(record.jobs) &&
    record.jobs.every((job: unknown) => 
      (record.source === "linkedIn" || record.source === "linked-in") ? isLinkedInJob(job) : isIndeedJob(job)
    )
  );
};

export const validateCrawledJobsArray = (data: unknown): CrawledJobs[] => {
  if (!Array.isArray(data)) {
    throw new Error("Expected array of crawled jobs");
  }
  
  const validatedJobs: CrawledJobs[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (isCrawledJobs(item)) {
      validatedJobs.push(item);
    } else {
      // Provide more detailed error information
      const itemPreview = JSON.stringify(item).slice(0, 200);
      throw new Error(`Invalid crawled jobs data at index ${i}: ${itemPreview}${itemPreview.length >= 200 ? '...' : ''}`);
    }
  }
  
  return validatedJobs;
};

export const validateCVProfile = (data: unknown): CVProfile => {
  if (typeof data !== "object" || data === null) {
    throw new Error("CV profile must be an object");
  }
  
  const record = data as Record<string, unknown>;
  
  const profile: CVProfile = {
    skills: Array.isArray(record.skills) ? record.skills.filter((s: unknown) => typeof s === "string") : [],
    experience_level: ["entry", "mid", "senior", "executive"].includes(record.experience_level as string) 
      ? record.experience_level as "entry" | "mid" | "senior" | "executive" : "entry",
    job_titles: Array.isArray(record.job_titles) ? record.job_titles.filter((t: unknown) => typeof t === "string") : [],
    industries: Array.isArray(record.industries) ? record.industries.filter((i: unknown) => typeof i === "string") : [],
    keywords: Array.isArray(record.keywords) ? record.keywords.filter((k: unknown) => typeof k === "string") : [],
    education: typeof record.education === "string" ? record.education : "",
    years_of_experience: typeof record.years_of_experience === "number" ? Math.max(0, record.years_of_experience) : 0,
    preferred_locations: Array.isArray(record.preferred_locations) ? record.preferred_locations.filter((l: unknown) => typeof l === "string") : [],
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

export const validateJobRanking = (data: unknown): JobRanking => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Job ranking must be an object");
  }
  
  const record = data as Record<string, unknown>;
  
  const ranking: JobRanking = {
    ranked_jobs: Array.isArray(record.ranked_jobs) 
      ? record.ranked_jobs.filter((job: unknown) => {
          if (typeof job !== "object" || job === null) return false;
          const jobRecord = job as Record<string, unknown>;
          return (
            typeof jobRecord.id === "string" &&
            Array.isArray(jobRecord.match_reasons) &&
            Array.isArray(jobRecord.concerns)
          );
        }).map((job: unknown) => {
          const jobRecord = job as Record<string, unknown>;
          return {
            id: jobRecord.id as string,
            match_reasons: (jobRecord.match_reasons as unknown[]).filter((r: unknown) => typeof r === "string") as string[],
            concerns: (jobRecord.concerns as unknown[]).filter((c: unknown) => typeof c === "string") as string[]
          };
        })
      : [],
    insights: {
      total_relevant: typeof (record.insights as Record<string, unknown>)?.total_relevant === "number" ? (record.insights as Record<string, unknown>).total_relevant as number : 0,
      avg_match_score: typeof (record.insights as Record<string, unknown>)?.avg_match_score === "number" ? (record.insights as Record<string, unknown>).avg_match_score as number : 0,
      top_skills_in_demand: Array.isArray((record.insights as Record<string, unknown>)?.top_skills_in_demand) 
        ? ((record.insights as Record<string, unknown>).top_skills_in_demand as unknown[]).filter((s: unknown) => typeof s === "string") as string[]
        : [],
      salary_insights: typeof (record.insights as Record<string, unknown>)?.salary_insights === "string" ? (record.insights as Record<string, unknown>).salary_insights as string : "",
      market_observations: typeof (record.insights as Record<string, unknown>)?.market_observations === "string" ? (record.insights as Record<string, unknown>).market_observations as string : "",
    }
  };
  
  return ranking;
};

export const validateBatchJobAnalysis = (data: unknown): BatchJobAnalysis => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Batch job analysis must be an object");
  }
  
  const record = data as Record<string, unknown>;
  
  const analysis: BatchJobAnalysis = {
    jobAnalyses: Array.isArray(record.jobAnalyses)
              ? record.jobAnalyses.filter((job: unknown) => {
            if (typeof job !== "object" || job === null) return false;
            const jobRecord = job as Record<string, unknown>;
            return (
              typeof jobRecord.jobId === "string" &&
              typeof jobRecord.experienceMatch === "object" &&
              typeof jobRecord.locationMatch === "object" &&
              Array.isArray(jobRecord.benefits) &&
              Array.isArray(jobRecord.requirements) &&
              typeof jobRecord.dataExtraction === "object"
            );
          }).map((job: unknown) => {
          const jobRecord = job as Record<string, unknown>;
          const experienceMatch = jobRecord.experienceMatch as Record<string, unknown>;
          const locationMatch = jobRecord.locationMatch as Record<string, unknown>;
          const benefits = jobRecord.benefits as unknown[];
          const requirements = jobRecord.requirements as unknown[];
          const dataExtraction = jobRecord.dataExtraction as Record<string, unknown>;
          
          return {
            jobId: jobRecord.jobId as string,
            experienceMatch: {
              match_level: ["perfect", "good", "partial", "poor", "mismatch"].includes(experienceMatch?.match_level as string)
                ? experienceMatch.match_level as "perfect" | "good" | "partial" | "poor" | "mismatch" : "poor",
              match_score: typeof experienceMatch?.match_score === "number" 
                ? Math.max(0, Math.min(1, experienceMatch.match_score)) : 0,
              match_reasons: Array.isArray(experienceMatch?.match_reasons) 
                ? (experienceMatch.match_reasons as unknown[]).filter((r: unknown) => typeof r === "string") as string[]
                : [],
              experience_gaps: Array.isArray(experienceMatch?.experience_gaps)
                ? (experienceMatch.experience_gaps as unknown[]).filter((g: unknown) => typeof g === "string") as string[]
                : [],
              recommendation: typeof experienceMatch?.recommendation === "string" 
                ? experienceMatch.recommendation as string : ""
            },
            locationMatch: {
              match_score: typeof locationMatch?.match_score === "number"
                ? Math.max(0, Math.min(1, locationMatch.match_score)) : 0,
              match_reasons: Array.isArray(locationMatch?.match_reasons)
                ? (locationMatch.match_reasons as unknown[]).filter((r: unknown) => typeof r === "string") as string[]
                : [],
              work_type_match: typeof locationMatch?.work_type_match === "string"
                ? locationMatch.work_type_match as string : "unknown"
            },
            benefits: Array.isArray(benefits) 
              ? benefits.filter((benefit: unknown) => {
                  if (typeof benefit !== "object" || benefit === null) return false;
                  const benefitRecord = benefit as Record<string, unknown>;
                  return typeof benefitRecord.description === "string";
                }).map((benefit: unknown) => {
                  const benefitRecord = benefit as Record<string, unknown>;
                  return {
                    description: benefitRecord.description as string,
                    details: typeof benefitRecord.details === "string" ? benefitRecord.details : undefined
                  };
                }) : [],
            requirements: Array.isArray(requirements)
              ? requirements.filter((req: unknown) => {
                  if (typeof req !== "object" || req === null) return false;
                  const reqRecord = req as Record<string, unknown>;
                  return typeof reqRecord.description === "string";
                }).map((req: unknown) => {
                  const reqRecord = req as Record<string, unknown>;
                  return {
                    description: reqRecord.description as string,
                    details: typeof reqRecord.details === "string" ? reqRecord.details : undefined
                  };
                }) : [],
            dataExtraction: {
              salary: {
                is_salary_mentioned: typeof (dataExtraction?.salary as Record<string, unknown>)?.is_salary_mentioned === "boolean"
                  ? (dataExtraction.salary as Record<string, unknown>).is_salary_mentioned as boolean : false,
                min: typeof (dataExtraction?.salary as Record<string, unknown>)?.min === "number" 
                  ? (dataExtraction.salary as Record<string, unknown>).min as number : null,
                max: typeof (dataExtraction?.salary as Record<string, unknown>)?.max === "number"
                  ? (dataExtraction.salary as Record<string, unknown>).max as number : null,
                currency: typeof (dataExtraction?.salary as Record<string, unknown>)?.currency === "string"
                  ? (dataExtraction.salary as Record<string, unknown>).currency as string : "USD"
              },
              company: {
                is_company_mentioned: typeof (dataExtraction?.company as Record<string, unknown>)?.is_company_mentioned === "boolean"
                  ? (dataExtraction.company as Record<string, unknown>).is_company_mentioned as boolean : false,
                name: typeof (dataExtraction?.company as Record<string, unknown>)?.name === "string"
                  ? (dataExtraction.company as Record<string, unknown>).name as string : null
              },
              job_type: {
                type: typeof (dataExtraction?.job_type as Record<string, unknown>)?.type === "string"
                  ? (dataExtraction.job_type as Record<string, unknown>).type as string : "full_time"
              }
            }
          };
        })
      : []
  };
  
  return analysis;
};

export const validateKeywordExtraction = (data: unknown): KeywordExtraction => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Keyword extraction must be an object");
  }
  
  const record = data as Record<string, unknown>;
  
  const extraction: KeywordExtraction = {
    primary_keywords: Array.isArray(record.primary_keywords) 
      ? (record.primary_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    secondary_keywords: Array.isArray(record.secondary_keywords) 
      ? (record.secondary_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    search_terms: Array.isArray(record.search_terms) 
      ? (record.search_terms as unknown[]).filter((t: unknown) => typeof t === "string") as string[] : [],
    job_title_keywords: Array.isArray(record.job_title_keywords) 
      ? (record.job_title_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    technical_skills: Array.isArray(record.technical_skills) 
      ? (record.technical_skills as unknown[]).filter((s: unknown) => typeof s === "string") as string[] : [],
    soft_skills: Array.isArray(record.soft_skills) 
      ? (record.soft_skills as unknown[]).filter((s: unknown) => typeof s === "string") as string[] : [],
    industry_terms: Array.isArray(record.industry_terms) 
      ? (record.industry_terms as unknown[]).filter((t: unknown) => typeof t === "string") as string[] : [],
    location_keywords: Array.isArray(record.location_keywords) 
      ? (record.location_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    company_type_keywords: Array.isArray(record.company_type_keywords) 
      ? (record.company_type_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    experience_level_keywords: Array.isArray(record.experience_level_keywords) 
      ? (record.experience_level_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    education_keywords: Array.isArray(record.education_keywords) 
      ? (record.education_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    certification_keywords: Array.isArray(record.certification_keywords) 
      ? (record.certification_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    salary_keywords: Array.isArray(record.salary_keywords) 
      ? (record.salary_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    benefit_keywords: Array.isArray(record.benefit_keywords) 
      ? (record.benefit_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
    work_arrangement_keywords: Array.isArray(record.work_arrangement_keywords) 
      ? (record.work_arrangement_keywords as unknown[]).filter((k: unknown) => typeof k === "string") as string[] : [],
  };
  
  return extraction;
};