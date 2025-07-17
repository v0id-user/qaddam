import { jobSchemas } from "../schemas";
import { Doc } from "../_generated/dataModel";
import type { MinimalLinkedInJob } from "../schemas/zod/linkedin";
import type { MinimalIndeedJob } from "../schemas/zod/indeed";

type JobListing = Doc<"jobListings">;

// Shared utility function for salary parsing
const parseSalary = (salaryText: string): { salary?: number; currency?: string } => {
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

export const normalizeJobListing = (jobResult: MinimalLinkedInJob | MinimalIndeedJob, source: 'indeed' | 'linkedIn'): JobListing | null => {
	try {
		if (source === 'linkedIn') {
			return normalizeLinkedInJob(jobResult as MinimalLinkedInJob);
		} else if (source === 'indeed') {
			return normalizeIndeedJob(jobResult as MinimalIndeedJob);
		}
		return null;
	} catch {
		return null;
	}
};

const normalizeLinkedInJob = (rawJob: MinimalLinkedInJob): JobListing | null => {
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
				const parsed = parseSalary(salaryText);
				salary = parsed.salary;
				currency = parsed.currency;
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
			name: rawJob.title,
			descriptionHtml: rawJob.descriptionHtml,
			description: rawJob.descriptionText ?? "",
			location: rawJob.location ?? "Unknown Location",
			salary,
			currency,
			source: "LinkedIn",
			sourceId: rawJob.id,
			datePosted,
			sourceUrl: rawJob.link,
			sourceName: rawJob.companyName ?? "Unknown Company",
			sourceLogo: undefined,
			sourceDescription: undefined,
			sourceLocation: rawJob.location ?? "Unknown Location",
		} as JobListing;
	} catch {
		return null;
	}
};

const normalizeIndeedJob = (rawJob: MinimalIndeedJob): JobListing | null => {
	try {
		if (!rawJob.positionName || !rawJob.url) {
			return null;
		}

		// Salary parsing for Indeed (salary is already a string)
		let salary: number | undefined;
		let currency: string | undefined;
		if (rawJob.salary && typeof rawJob.salary === "string") {
			const parsed = parseSalary(rawJob.salary);
			salary = parsed.salary;
			currency = parsed.currency;
		}

		// Generate a unique sourceId for Indeed jobs (using URL as base)
		const sourceId = rawJob.url.split('/').pop() || rawJob.url;

		return {
			name: rawJob.positionName,
			descriptionHtml: "", // Indeed doesn't provide HTML description
			description: rawJob.jobType.join(", "), // Use job types as description
			location: rawJob.location,
			salary,
			currency,
			source: "Indeed",
			sourceId,
			datePosted: undefined, // Indeed doesn't provide posting date
			sourceUrl: rawJob.url,
			sourceName: rawJob.company,
			sourceLogo: rawJob.companyInfo?.companyLogo,
			sourceDescription: rawJob.companyInfo?.companyDescription,
			sourceLocation: rawJob.location,
		} as JobListing;
	} catch {
		return null;
	}
};