import { internal } from "../_generated/api";
import { action, internalAction, internalMutation } from "../_generated/server";
import { type GenericId, v } from "convex/values";
// Simple job data for migration - only essential fields
interface SimpleJobData {
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
}

// Insert data into the database - simplified validator
export const migrateJobs = internalMutation({
	args: {
		jobListings: v.array(
			v.object({
				url: v.string(),
				title: v.string(),
				descriptionHtml: v.string(),
				description: v.string(),
				company: v.string(),
				location: v.string(),
				salary: v.optional(v.number()),
				currency: v.optional(v.string()),
				datePosted: v.optional(v.number()),
				sourceId: v.string(),
			}),
		),
	},
	handler: async (
		ctx,
		{ jobListings },
	): Promise<GenericId<"jobListings">[]> => {
		const insertedJobs: GenericId<"jobListings">[] = [];
		let skippedJobs = 0;

		for (const jobData of jobListings) {
			try {
				// Validate essential fields only
				if (
					!jobData.title ||
					!jobData.description ||
					!jobData.company ||
					!jobData.url
				) {
					console.log(
						`Skipping job due to missing essential fields: ${jobData.sourceId || "unknown"}`,
					);
					skippedJobs++;
					continue;
				}

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
				console.log(`Failed to insert job ${jobData.sourceId || "unknown"}:`, {
					error,
				});
				skippedJobs++;
			}
		}

		console.log(
			`Successfully inserted ${insertedJobs.length} job listings, skipped ${skippedJobs} invalid jobs`,
		);
		return insertedJobs;
	},
});

// Extract essential data from LinkedIn jobs
function extractEssentialJobData(rawJob: any): SimpleJobData | null {
	try {
		// Only require the absolute essentials
		if (!rawJob.id || !rawJob.title || !rawJob.link) {
			return null;
		}

		// Parse salary if available
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

		// Parse date if available
		let datePosted: number | undefined;
		if (rawJob.postedAt) {
			try {
				const parsedDate = new Date(rawJob.postedAt);
				if (!isNaN(parsedDate.getTime())) {
					datePosted = parsedDate.getTime();
				}
			} catch {
				// Ignore date parsing errors
			}
		}

		return {
			url: rawJob.link,
			title: rawJob.title,
			descriptionHtml: rawJob.descriptionHtml,
			description: rawJob.descriptionText || "",
			company: rawJob.companyName || "Unknown Company",
			location: rawJob.location || "Unknown Location",
			salary,
			currency,
			datePosted,
			sourceId: rawJob.id,
		};
	} catch (error) {
		console.log(`Failed to extract job data:`, { error });
		return null;
	}
}

// Get data from storage and extract only essential fields
export const migrateJobsAction = internalAction({
	handler: async (ctx): Promise<GenericId<"jobListings">[]> => {
		const linkedInJobsStorageIds = [
			"kg24ag2b5pz9zzb7d6mt0ncefd7kdwxt",
			"kg26h3j1qk72w9j51m2mh8n8ds7kd4ep",
			"kg260jn45jwst3mfznpcw30ep17kd4yc",
			"kg20c664skkzh7wcy3kx41fn5h7kdb5r",
		];

		// Get all jobs dataset files from the storage
		const files = await Promise.all(
			linkedInJobsStorageIds.map(async (id) => {
				const url = await ctx.storage.getUrl(id as GenericId<"_storage">);
				if (!url) {
					throw new Error(`Could not get URL for storage ID ${id}`);
				}
				const response = await fetch(url);
				const content = await response.text();
				return content;
			}),
		);

		const allJobListings: SimpleJobData[] = [];
		let skippedFiles = 0;

		// Parse each file and extract only essential job data
		for (let i = 0; i < files.length; i++) {
			const fileContent = files[i];
			const storageId = linkedInJobsStorageIds[i];

			try {
				if (!fileContent || fileContent.trim() === "") {
					console.log(`Skipping empty file from storage ID: ${storageId}`);
					skippedFiles++;
					continue;
				}

				const parsedData = JSON.parse(fileContent);
				let jobsProcessed = 0;
				let jobsSkipped = 0;

				// Handle both single job and array of jobs
				if (Array.isArray(parsedData)) {
					for (const rawJob of parsedData) {
						const essentialJob = extractEssentialJobData(rawJob);
						if (essentialJob) {
							allJobListings.push(essentialJob);
							jobsProcessed++;
						} else {
							jobsSkipped++;
						}
					}
				} else {
					const essentialJob = extractEssentialJobData(parsedData);
					if (essentialJob) {
						allJobListings.push(essentialJob);
						jobsProcessed++;
					} else {
						jobsSkipped++;
					}
				}

				console.log(
					`Storage ${storageId}: Processed ${jobsProcessed} jobs, skipped ${jobsSkipped} invalid jobs`,
				);
			} catch (error) {
				console.log(`Failed to parse job data from storage ID ${storageId}:`, {
					error,
				});
				skippedFiles++;
			}
		}

		console.log(
			`Found ${allJobListings.length} valid job listings from ${files.length - skippedFiles} files (${skippedFiles} files skipped)`,
		);

		// Migrate jobs in batches
		const batchSize = 50;
		const insertedJobIds: GenericId<"jobListings">[] = [];

		for (let i = 0; i < allJobListings.length; i += batchSize) {
			const batch = allJobListings.slice(i, i + batchSize);
			const batchIds: GenericId<"jobListings">[] = await ctx.runMutation(
				internal.scripts.saveJobs.migrateJobs,
				{
					jobListings: batch,
				},
			);
			insertedJobIds.push(...batchIds);

			console.log(
				`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${batchIds.length}/${batch.length} jobs`,
			);
		}

		console.log(
			`Migration complete! Inserted ${insertedJobIds.length} jobs total`,
		);
		return insertedJobIds;
	},
});

// Can be called thro CLI:
// example: npx convex run scripts/saveJobs:runMigration
export const runMigration = action({
	handler: async (ctx): Promise<void> => {
		await ctx.runAction(internal.scripts.saveJobs.migrateJobsAction, {});
	},
});
