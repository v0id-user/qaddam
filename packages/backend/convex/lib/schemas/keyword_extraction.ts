import { z } from "zod";

export const keyword_extraction_schema = z.object({
	primary_keywords: z
		.array(z.string())
		.describe("Main keywords from skills and experience"),
	secondary_keywords: z
		.array(z.string())
		.describe("Supporting keywords and related terms"),
	search_terms: z
		.array(z.string())
		.describe("Specific search terms for job database queries"),
	job_title_keywords: z.array(z.string()).describe("Job titles and role names"),
	technical_skills: z
		.array(z.string())
		.describe("Technical skills and technologies"),
	soft_skills: z
		.array(z.string())
		.describe("Soft skills and interpersonal abilities"),
	industry_terms: z.array(z.string()).describe("Industry-specific terminology"),
	location_keywords: z.array(z.string()).describe("Location-related keywords"),
	company_type_keywords: z
		.array(z.string())
		.describe("Company type and size keywords"),
	experience_level_keywords: z
		.array(z.string())
		.describe("Experience level indicators"),
	education_keywords: z
		.array(z.string())
		.describe("Education and qualification keywords"),
	certification_keywords: z
		.array(z.string())
		.describe("Certification and credential keywords"),
	salary_keywords: z
		.array(z.string())
		.describe("Salary and compensation keywords"),
	benefit_keywords: z.array(z.string()).describe("Benefits and perks keywords"),
	work_arrangement_keywords: z
		.array(z.string())
		.describe("Work arrangement keywords (remote, hybrid, etc.)"),
});

export type KeywordExtraction = z.infer<typeof keyword_extraction_schema>;
