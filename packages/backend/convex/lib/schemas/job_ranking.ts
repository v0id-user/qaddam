import { z } from "zod";

export const job_ranking_schema = z.object({
	ranked_jobs: z.array(
		z.object({
			id: z.string(),
			match_reasons: z.array(z.string()),
			concerns: z.array(z.string()),
		}),
	),
	insights: z.object({
		total_relevant: z.number(),
		avg_match_score: z.number(),
		top_skills_in_demand: z.array(z.string()),
		salary_insights: z.string(),
		market_observations: z.string(),
	}),
});

export type JobRanking = z.infer<typeof job_ranking_schema>;
