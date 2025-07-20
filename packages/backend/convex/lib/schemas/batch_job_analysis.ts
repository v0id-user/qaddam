import { z } from "zod";

export const batch_job_analysis_schema = z.object({
	jobAnalyses: z.array(
		z.object({
			jobId: z.string(),
			experienceMatch: z.object({
				match_level: z.enum(["perfect", "good", "partial", "poor", "mismatch"]),
				match_score: z.number().min(0).max(1),
				match_reasons: z.array(z.string()).min(1),
				experience_gaps: z.array(z.string()),
				recommendation: z.string(),
			}),
			locationMatch: z.object({
				match_score: z.number().min(0).max(1),
				match_reasons: z.array(z.string()).min(1),
				work_type_match: z.string(),
			}),
			benefits: z.array(
				z.object({
					description: z.string(),
					details: z.string().optional(),
				}),
			),
			requirements: z.array(
				z.object({
					description: z.string(),
					details: z.string().optional(),
				}),
			),
			dataExtraction: z.object({
				salary: z.object({
					is_salary_mentioned: z.boolean(),
					min: z.number().nullable(),
					max: z.number().nullable(),
					currency: z.string(),
				}),
				company: z.object({
					is_company_mentioned: z.boolean(),
					name: z.string().nullable(),
				}),
				job_type: z.object({
					type: z.string(),
				}),
			}),
		}),
	),
});

export type BatchJobAnalysis = z.infer<typeof batch_job_analysis_schema>;
