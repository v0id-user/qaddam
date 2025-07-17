import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { logger } from "./lib/axiom";

type JobListing = Doc<"jobListings">;

// LinkedIn job interface based on existing types
interface LinkedInJob {
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

// Indeed job interface based on existing types
interface IndeedJob {
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

// Shared utility function for salary parsing
const parse_salary = (salaryText: string): { salary?: number; currency?: string } => {
  let salary: number | undefined;
  let currency: string | undefined;

  // Extract salary range if present (e.g. "100,000 - 150,000")
  const salaryRangeMatch = salaryText.match(/([\d,]+)\s*-\s*([\d,]+)/);
  if (salaryRangeMatch) {
    const minSalary = parseInt(salaryRangeMatch[1].replace(/,/g, ""));
    const maxSalary = parseInt(salaryRangeMatch[2].replace(/,/g, ""));
    // Use average of range
    salary = Math.floor((minSalary + maxSalary) / 2);
  } else {
    // Fall back to single number
    const singleSalaryMatch = salaryText.match(/[\d,]+/);
    if (singleSalaryMatch) {
      salary = parseInt(singleSalaryMatch[0].replace(/,/g, ""));
    }
  }

  // Extract currency symbol/code with more comprehensive matching
  const currencyMatch = salaryText.match(/(\$|USD|EUR|£|GBP|AED|SAR|€)/i);
  if (currencyMatch) {
    // Normalize currency codes
    const currencyMap: Record<string, string> = {
      $: "USD",
      "£": "GBP",
      "€": "EUR",
    };
    currency = currencyMap[currencyMatch[0]] || currencyMatch[0];
  }

  return { salary, currency };
};

// Helper function to normalize LinkedIn job
const normalize_linkedin_job = (raw: LinkedInJob): JobListing | null => {
  try {
    if (!raw.id || !raw.title || !raw.link) {
      return null;
    }

    // Salary parsing (best-effort)
    let salary: number | undefined;
    let currency: string | undefined;
    if (
      raw.salaryInfo &&
      Array.isArray(raw.salaryInfo) &&
      raw.salaryInfo.length > 0
    ) {
      const salaryText = raw.salaryInfo[0];
      if (salaryText && typeof salaryText === "string") {
        const parsed = parse_salary(salaryText);
        salary = parsed.salary;
        currency = parsed.currency;
      }
    }

    // Date parsing (best-effort)
    let datePosted: number | undefined;
    if (raw.postedAt) {
      const parsedDate = new Date(raw.postedAt);
      if (!isNaN(parsedDate.getTime())) {
        datePosted = parsedDate.getTime();
      }
    }

    return {
      name: raw.title,
      descriptionHtml: raw.descriptionHtml || "",
      description: raw.descriptionText || "",
      location: raw.location,
      salary,
      currency,
      source: "LinkedIn",
      sourceId: raw.id,
      datePosted,
      sourceUrl: raw.link,
      sourceName: raw.companyName,
      sourceLogo: undefined,
      sourceDescription: undefined,
      sourceLocation: raw.location,
    };
  } catch {
    return null;
  }
};

// Helper function to normalize Indeed job
const normalize_indeed_job = (raw: IndeedJob): JobListing | null => {
  try {
    if (!raw.positionName || !raw.url) {
      return null;
    }

    // Salary parsing for Indeed (salary is already a string)
    let salary: number | undefined;
    let currency: string | undefined;
    if (raw.salary && typeof raw.salary === "string") {
      const parsed = parse_salary(raw.salary);
      salary = parsed.salary;
      currency = parsed.currency;
    }

    // Generate a unique sourceId for Indeed jobs (using URL as base)
    const sourceId = raw.url.split('/').pop() || raw.url;

    return {
      name: raw.positionName,
      descriptionHtml: "", // Indeed doesn't provide HTML description
      description: raw.jobType?.join(", ") || "", // Use job types as description
      location: raw.location,
      salary,
      currency,
      source: "Indeed",
      sourceId,
      datePosted: undefined, // Indeed doesn't provide posting date
      sourceUrl: raw.url,
      sourceName: raw.company,
      sourceLogo: raw.companyInfo?.companyLogo,
      sourceDescription: raw.companyInfo?.companyDescription,
      sourceLocation: raw.location,
    };
  } catch {
    return null;
  }
};

// Core normalization function
export const normalize_job = (raw: unknown, source: string): JobListing | null => {
  try {
    if (source === "linked-in") {
      return normalize_linkedin_job(raw as LinkedInJob);
    } else if (source === "indeed") {
      return normalize_indeed_job(raw as IndeedJob);
    }
    return null;
  } catch {
    return null;
  }
};

// Main mutation to normalize and save job results
export const add_new_jobs_listing = internalMutation({
  args: {
    jobSearchResults: v.any(),
  },
  handler: async (ctx, { jobSearchResults }): Promise<string[]> => {
    const insertedIds: string[] = [];
    let skippedJobs = 0;

    logger.info("Starting job normalization process", {
      inputType: typeof jobSearchResults,
      isArray: Array.isArray(jobSearchResults),
    });

    // Handle the input - it could be an array or a single object
    let resultsArray: unknown[] = [];
    
    if (Array.isArray(jobSearchResults)) {
      resultsArray = jobSearchResults;
    } else {
      resultsArray = [jobSearchResults];
    }

    // Process each result item
    for (const result of resultsArray) {
      if (!result || typeof result !== "object") {
        skippedJobs++;
        continue;
      }

      const resultObj = result as Record<string, unknown>;
      
      // Check if this is a wrapper object like { linkedInJobs: [...] } or { indeedJobs: [...] }
      if ("linkedInJobs" in resultObj && Array.isArray(resultObj.linkedInJobs)) {
        // Process LinkedIn jobs
        for (const rawJob of resultObj.linkedInJobs) {
          const normalizedJob = normalize_job(rawJob, "linked-in");
          
          if (normalizedJob) {
            try {
              const jobId = await ctx.db.insert("jobListings", normalizedJob);
              insertedIds.push(jobId);
            } catch (error) {
              logger.error("Failed to insert LinkedIn job", { error, jobId: (rawJob as any)?.id });
              skippedJobs++;
            }
          } else {
            skippedJobs++;
          }
        }
      } else if ("indeedJobs" in resultObj && Array.isArray(resultObj.indeedJobs)) {
        // Process Indeed jobs
        for (const rawJob of resultObj.indeedJobs) {
          const normalizedJob = normalize_job(rawJob, "indeed");
          
          if (normalizedJob) {
            try {
              const jobId = await ctx.db.insert("jobListings", normalizedJob);
              insertedIds.push(jobId);
            } catch (error) {
              logger.error("Failed to insert Indeed job", { error, jobUrl: (rawJob as any)?.url });
              skippedJobs++;
            }
          } else {
            skippedJobs++;
          }
        }
      } else if ("source" in resultObj && typeof resultObj.source === "string") {
        // Handle objects with explicit source field
        const source = resultObj.source;
        
        if (source === "linked-in" || source === "indeed") {
          const normalizedJob = normalize_job(resultObj, source);
          
          if (normalizedJob) {
            try {
              const jobId = await ctx.db.insert("jobListings", normalizedJob);
              insertedIds.push(jobId);
            } catch (error) {
              logger.error(`Failed to insert ${source} job`, { error });
              skippedJobs++;
            }
          } else {
            skippedJobs++;
          }
        } else {
          logger.warn("Unknown source type", { source });
          skippedJobs++;
        }
      } else {
        // Try to infer from the object structure
        const hasLinkedInFields = "id" in resultObj && "title" in resultObj && "link" in resultObj;
        const hasIndeedFields = "positionName" in resultObj && "url" in resultObj && "company" in resultObj;
        
        if (hasLinkedInFields) {
          const normalizedJob = normalize_job(resultObj, "linked-in");
          
          if (normalizedJob) {
            try {
              const jobId = await ctx.db.insert("jobListings", normalizedJob);
              insertedIds.push(jobId);
            } catch (error) {
              logger.error("Failed to insert inferred LinkedIn job", { error });
              skippedJobs++;
            }
          } else {
            skippedJobs++;
          }
        } else if (hasIndeedFields) {
          const normalizedJob = normalize_job(resultObj, "indeed");
          
          if (normalizedJob) {
            try {
              const jobId = await ctx.db.insert("jobListings", normalizedJob);
              insertedIds.push(jobId);
            } catch (error) {
              logger.error("Failed to insert inferred Indeed job", { error });
              skippedJobs++;
            }
          } else {
            skippedJobs++;
          }
        } else {
          logger.warn("Unable to determine job source", { 
            keys: Object.keys(resultObj),
            hasLinkedInFields,
            hasIndeedFields 
          });
          skippedJobs++;
        }
      }
    }

    logger.info("Job normalization completed", {
      inserted: insertedIds.length,
      skipped: skippedJobs,
      total: insertedIds.length + skippedJobs,
    });

    return insertedIds;
  },
});