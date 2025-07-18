import { z } from "zod";

export const cv_profile_schema = z.object({
	skills: z.array(z.string()).min(1).describe("List of skills"),
	experience_level: z.enum(["entry", "mid", "senior", "executive"]).describe("Experience level"),
	job_titles: z.array(z.string()).min(1).describe("Previous job titles"),
	industries: z.array(z.string()).min(1).describe("Industries worked in"),
	keywords: z.array(z.string()).min(1).describe("Relevant keywords"),
	education: z.string().min(1).describe("Education background"),
	years_of_experience: z.number().min(0).describe("Years of experience"),
	preferred_locations: z.array(z.string()).min(1).describe("Preferred work locations"),
});

export type CVProfile = z.infer<typeof cv_profile_schema>; 