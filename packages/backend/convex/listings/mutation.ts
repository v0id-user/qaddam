import { internalMutation } from "../_generated/server";
import { GenericId, v } from "convex/values";
import type { LinkedInJob } from "../driver/jobs/actors/linkedin_jobs";

// Helper type for a raw result coming from the LinkedIn Job actor
// It can be either a single LinkedInJob object or an object that wraps the
// jobs inside the `linkedInJobs` array (as returned by the actor dataset).
// This allows the mutation to remain flexible with the incoming payload.
type LinkedInJobResult = LinkedInJob | { linkedInJobs: LinkedInJob[] };

// Mutation that receives the raw job-search results and persists them in the
// `jobListings` table after extracting only the essential fields we care about.
export const addNewJobsListing = internalMutation({
    // Keep the validator broad – the action will pass the raw actor results.
    // We validate/clean the data ourselves before inserting.
    args: {
        jobSearchResults: v.any(),
    },
    handler: async (
        ctx,
        { jobSearchResults },
    ): Promise<GenericId<"jobListings">[]> => {
        const insertedJobs: GenericId<"jobListings">[] = [];
        let skippedJobs = 0;

        // --- helper to pull out the fields we need from a LinkedIn job object ---
        const extractEssentialJobData = (
            rawJob: LinkedInJob,
        ): {
            url: string;
            title: string;
            descriptionHtml: string;
            description: string;
            company: string;
            location: string;
            salary?: number;
            currency?: string;
            datePosted?: number;
            sourceId: string;
        } | null => {
            try {
                if (!rawJob.id || !rawJob.title || !rawJob.link) {
                    return null;
                }

                // Salary parsing (best-effort)
                let salary: number | undefined;
                let currency: string | undefined;
                if (
                    rawJob.salaryInfo &&
                    Array.isArray(rawJob.salaryInfo) &&
                    rawJob.salaryInfo.length > 0
                ) {
                    const salaryText = rawJob.salaryInfo[0];
                    if (salaryText && typeof salaryText === "string") {
                        const salaryMatch = salaryText.match(/[\d,]+/);
                        if (salaryMatch) {
                            salary = parseInt(salaryMatch[0].replace(/,/g, ""));
                        }
                        const currencyMatch = salaryText.match(/\$|USD|EUR|£|GBP/i);
                        if (currencyMatch) {
                            currency = currencyMatch[0];
                        }
                    }
                }

                // Date parsing (best-effort)
                let datePosted: number | undefined;
                if (rawJob.postedAt) {
                    const parsedDate = new Date(rawJob.postedAt);
                    if (!isNaN(parsedDate.getTime())) {
                        datePosted = parsedDate.getTime();
                    }
                }

                return {
                    url: rawJob.link,
                    title: rawJob.title,
                    descriptionHtml: rawJob.descriptionHtml,
                    description: rawJob.descriptionText ?? "",
                    company: rawJob.companyName ?? "Unknown Company",
                    location: rawJob.location ?? "Unknown Location",
                    salary,
                    currency,
                    datePosted,
                    sourceId: rawJob.id,
                };
            } catch {
                return null;
            }
        };

        // Normalise the incoming payload to an array for simpler processing.
        const resultsArray: LinkedInJobResult[] = Array.isArray(jobSearchResults)
            ? (jobSearchResults as LinkedInJobResult[])
            : [jobSearchResults as LinkedInJobResult];

        // Iterate over all items and persist the extracted jobs.
        for (const result of resultsArray) {
            // If the actor wrapped the jobs inside `linkedInJobs`, handle that.
            if (result && Array.isArray((result as any).linkedInJobs)) {
                for (const raw of (result as { linkedInJobs: LinkedInJob[] }).linkedInJobs) {
                    const jobData = extractEssentialJobData(raw);
                    if (jobData) {
                        try {
                            const jobId = await ctx.db.insert("jobListings", {
                                name: jobData.title,
                                descriptionHtml: jobData.descriptionHtml,
                                description: jobData.description,
                                location: jobData.location,
                                salary: jobData.salary,
                                currency: jobData.currency,
                                source: "LinkedIn",
                                sourceId: jobData.sourceId,
                                datePosted: jobData.datePosted,
                                sourceUrl: jobData.url,
                                sourceName: jobData.company,
                                sourceLogo: undefined,
                                sourceDescription: undefined,
                                sourceLocation: jobData.location,
                            });
                            insertedJobs.push(jobId);
                        } catch (error) {
                            console.error(`Failed to insert job ${jobData.sourceId}:`, error);
                            skippedJobs++;
                        }
                    } else {
                        skippedJobs++;
                    }
                }
            } else {
                // Treat the result itself as a LinkedInJob object.
                const jobData = extractEssentialJobData(result as LinkedInJob);
                if (jobData) {
                    try {
                        const jobId = await ctx.db.insert("jobListings", {
                            name: jobData.title,
                            descriptionHtml: jobData.descriptionHtml,
                            description: jobData.description,
                            location: jobData.location,
                            salary: jobData.salary,
                            currency: jobData.currency,
                            source: "LinkedIn",
                            sourceId: jobData.sourceId,
                            datePosted: jobData.datePosted,
                            sourceUrl: jobData.url,
                            sourceName: jobData.company,
                            sourceLogo: undefined,
                            sourceDescription: undefined,
                            sourceLocation: jobData.location,
                        });
                        insertedJobs.push(jobId);
                    } catch (error) {
                        console.error(`Failed to insert job ${jobData?.sourceId ?? "unknown"}:`, error);
                        skippedJobs++;
                    }
                } else {
                    skippedJobs++;
                }
            }
        }

        console.log(
            `Finished inserting ${insertedJobs.length} job listings, skipped ${skippedJobs} invalid items`,
        );
        return insertedJobs;
    },
});