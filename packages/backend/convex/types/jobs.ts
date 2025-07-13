import type { Id } from "../_generated/dataModel";

export type JobType = "full_time" | "part_time" | "contract" | "remote";

export type JobResult = {
	jobListingId: Id<"jobListings">;

	// AI Analysis fields
	benefits: string[];
	matchedSkills: string[];
	missingSkills: string[];
	experienceMatch: string;
	experienceMatchScore: number;
	experienceMatchReasons: string[];
	locationMatch: string;
	locationMatchScore: number;
	locationMatchReasons: string[];
	workTypeMatch?: boolean;
	requirements: string[]; // AI-extracted job requirements

	// AI Ranking fields (from combineResults.ts)
	aiMatchReasons?: string[];
	aiConcerns?: string[];
	aiRecommendation?:
		| "highly_recommended"
		| "recommended"
		| "consider"
		| "not_recommended";

	// Pre-extracted data to avoid redundant AI calls in combineResults
	extractedData?: {
		salary: {
			min: number | null;
			max: number | null;
			currency: string | null;
			is_salary_mentioned: boolean;
		};
		company: {
			name: string | null;
			is_company_mentioned: boolean;
		};
		jobType: {
			type: JobType | null;
			is_remote: boolean;
			work_arrangement: string | null;
		};
	};
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
