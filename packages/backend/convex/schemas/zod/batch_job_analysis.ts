import { z } from "zod";

// Batch job analysis schema for comprehensive job processing
export const BatchJobAnalysisSchema = z.object({
  jobAnalyses: z.array(
    z.object({
      jobId: z.string(),
      // Experience matching
      experienceMatch: z.object({
        match_level: z.enum([
          "excellent_match",
          "good_match",
          "partial_match",
          "mismatch",
        ]),
        match_score: z.number().min(0).max(1),
        match_reasons: z.array(z.string()).min(1),
        experience_gaps: z.array(z.string()),
        recommendation: z.string(),
      }),
      // Location matching
      locationMatch: z.object({
        match_score: z.number().min(0).max(1),
        match_reasons: z.array(z.string()).min(1),
        work_type_match: z.boolean(),
      }),
      // Benefits extraction
      benefits: z.array(
        z.object({
          category: z.enum([
            "health_insurance",
            "retirement_savings",
            "paid_time_off",
            "flexible_work",
            "professional_development",
            "wellness",
            "financial_perks",
            "transportation",
            "family_support",
            "other",
          ]),
          description: z.string(),
          details: z.string().nullable(),
        }),
      ),
      // Requirements extraction
      requirements: z.array(
        z.object({
          type: z.enum([
            "technical_skill",
            "experience",
            "education",
            "certification",
            "soft_skill",
            "tool_software",
            "other",
          ]),
          description: z.string(),
          required: z.boolean(),
          details: z.string().nullable(),
        }),
      ),
      // Data extraction
      dataExtraction: z.object({
        salary: z.object({
          min: z.number().nullable(),
          max: z.number().nullable(),
          currency: z.string().nullable(),
          is_salary_mentioned: z.boolean(),
        }),
        company: z.object({
          name: z.string().nullable(),
          is_company_mentioned: z.boolean(),
        }),
        job_type: z.object({
          type: z
            .enum(["full_time", "part_time", "contract", "remote"])
            .nullable(),
          is_remote: z.boolean(),
          work_arrangement: z.string().nullable(),
        }),
      }),
    }),
  ),
});

export type BatchJobAnalysis = z.infer<typeof BatchJobAnalysisSchema>;