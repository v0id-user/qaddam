import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal, api } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from 'convex/values'
import { Agent, createTool } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai"
import { z } from "zod";

export const workflow = new WorkflowManager(components.workflow);

// Shared types for job results
export type JobResult = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  remote: boolean;
  url: string;
  postedDate: string;
  matchScore: number;
};

export type JobSearchResults = {
  jobs: JobResult[];
  totalFound: number;
  searchParams: {
    keywords: string[];
    location: string;
    jobType: string;
    experienceLevel: string;
  };
};

// Step 1: Parse CV and extract user profile
export const aiParseCV = internalAction({
    args: {
        cv_storage_id: v.id("_storage"),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args): Promise<any> => {
        const agent = new Agent(components.agent, {
            chat: openai.chat("gpt-4o-mini"),
            instructions: `
            <agent>
  <name>JobSearchProfileAgent</name>
  <description>
    An AI agent that parses CVs and extracts structured job search profiles for automated job discovery.
  </description>

  <goals>
    <goal>Extract key information from CV: skills, experience, education, job titles, industries</goal>
    <goal>Infer job search preferences and suitable job types based on CV content</goal>
    <goal>Generate structured profile data for job search algorithms</goal>
    <goal>Support multilingual CVs (English + Arabic)</goal>
  </goals>

  <rules>
    <rule>Extract concrete skills, technologies, and experience levels from CV text</rule>
    <rule>Infer suitable job titles and industries based on background</rule>
    <rule>Determine experience level: entry-level, mid-level, senior, executive</rule>
    <rule>Identify location preferences if mentioned</rule>
    <rule>Generate relevant keywords for job searching</rule>
    <rule>Output structured JSON data that can be consumed by search algorithms</rule>
  </rules>
</agent>
            `,
            tools: {
                extractCVProfile: createTool({
                    description: "Extract structured profile from CV text",
                    args: z.object({
                        skills: z.array(z.string()).describe("Technical and soft skills found in CV"),
                        experience_level: z.enum(["entry", "mid", "senior", "executive"]).describe("Inferred experience level"),
                        job_titles: z.array(z.string()).describe("Suitable job titles based on experience"),
                        industries: z.array(z.string()).describe("Relevant industries"),
                        keywords: z.array(z.string()).describe("Search keywords for job matching"),
                        education: z.string().describe("Highest education level"),
                        years_of_experience: z.number().describe("Estimated years of experience"),
                        preferred_locations: z.array(z.string()).describe("Location preferences if mentioned"),
                    }),
                    handler: async (ctx, args) => {
                        // Store the extracted profile for the next step
                        return args;
                    }
                })
            },
            textEmbedding: openai.embedding("text-embedding-3-small"),
            maxSteps: 5,
            maxRetries: 3,
        });

        const user = await ctx.runQuery(api.users.getMe);
        const thread = await agent.createThread(ctx, {
            userId: args.userId || user?._id,
        });

        const { cv_storage_id } = args;
        const cv = await ctx.storage.get(cv_storage_id);
        
        if (!cv) {
            throw new Error("CV file not found in storage");
        }

        // Convert CV to text (this would need proper PDF/DOC parsing)
        const cvText = await cv.text(); // This is a placeholder - you'd use a proper PDF parser
        
        const result = ""// TODO: extract the result from the agent

        return result;
    }
});

// Step 2: Job search tuning based on user preferences and CV
export const aiTuneJobSearch = internalAction({
    args: {
        cvProfile: v.any(), // Profile from step 1
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args): Promise<any> => {
        const agent = new Agent(components.agent, {
            chat: openai.chat("gpt-4o-mini"),
            instructions: `
            <agent>
  <name>JobSearchTuningAgent</name>
  <description>
    An AI agent that optimizes job search parameters based on user profile and market conditions.
  </description>

  <goals>
    <goal>Interpret survey-style input from users to infer a concise job search profile.</goal>
    <goal>Support multilingual input (English + Arabic) and output accordingly.</goal>
    <goal>Generate highly relevant search signals for backend scraping processes.</goal>
    <goal>Detect implied user preferences and fill missing gaps (e.g., job type, experience level).</goal>
    <goal>Provide consistent structured insight that downstream agents or services can consume.</goal>
  </goals>

  <rules>
    <rule>Never hallucinate job content — your role is inference, not fabrication.</rule>
    <rule>Respond using the language the user used in their input, unless context suggests otherwise.</rule>
    <rule>Adjust for regional expectations (e.g., "remote" in the Gulf may imply hybrid or flexible schedules).</rule>
    <rule>Always prefer semantic matches over literal ones (e.g., "خريج جديد" maps to "entry level").</rule>
    <rule>If user answers are partial or vague, apply neutral or commonly safe defaults (e.g., default to "tech" if domain is unclear but skills are software-related).</rule>
    <rule>Derive job titles, industries, and search keywords from explicit and implicit user intent.</rule>
    <rule>Structure insights in a clean, compact way that backend services can easily parse.</rule>
    <rule>Maintain a helpful and context-aware tone, even though you do not directly speak to the user.</rule>
    <rule>Gracefully handle edge cases like missing language tags, mixed inputs, or contradictory answers.</rule>
  </rules>
</agent>
            `,
            tools: {
                tuneSearchParams: createTool({
                    description: "Generate optimized job search parameters",
                    args: z.object({
                        optimized_keywords: z.array(z.string()).describe("Enhanced search keywords"),
                        target_job_titles: z.array(z.string()).describe("Specific job titles to search for"),
                        target_companies: z.array(z.string()).describe("Recommended companies to target"),
                        salary_range: z.object({
                            min: z.number(),
                            max: z.number(),
                            currency: z.string()
                        }).describe("Suggested salary range"),
                        preferred_job_types: z.array(z.enum(["full-time", "part-time", "contract", "internship"])),
                        locations: z.array(z.string()).describe("Target locations including remote"),
                        search_strategy: z.string().describe("Personalized search approach"),
                    }),
                    handler: async (ctx, args) => {
                        return args;
                    }
                })
            },
            maxSteps: 3,
            maxRetries: 2,
        });

        const user = await ctx.runQuery(api.users.getMe);
        const thread = await agent.createThread(ctx, {
            userId: args.userId || user?._id,
        });

        const result = ""// TODO: extract the result from the agent

        return result;
    }
});

// Step 3: Search for jobs using optimized parameters
export const aiSearchJobs = internalAction({
    args: {
        searchParams: v.any(), // Tuned parameters from step 2
        cvProfile: v.any(), // Original profile from step 1
    },
    handler: async (ctx, args): Promise<any> => {
        // This would integrate with actual job boards APIs
        // For now, returning mock data that matches the expected structure
        
        const mockJobs: JobResult[] = [
            {
                id: "job-1",
                title: "Senior Frontend Developer",
                company: "TechCorp",
                location: "Riyadh, Saudi Arabia",
                description: "We are looking for a skilled Frontend Developer to join our team...",
                requirements: ["React", "TypeScript", "CSS", "JavaScript"],
                salary: "15000-25000 SAR",
                type: "full-time",
                remote: true,
                url: "https://techcorp.com/jobs/frontend-dev",
                postedDate: new Date().toISOString(),
                matchScore: 0.95,
            },
            {
                id: "job-2", 
                title: "Full Stack Engineer",
                company: "StartupXYZ",
                location: "Dubai, UAE",
                description: "Join our fast-growing startup as a Full Stack Engineer...",
                requirements: ["Node.js", "React", "MongoDB", "AWS"],
                salary: "12000-20000 AED",
                type: "full-time",
                remote: false,
                url: "https://startupxyz.com/careers/fullstack",
                postedDate: new Date().toISOString(),
                matchScore: 0.87,
            },
            {
                id: "job-3",
                title: "Backend Developer",
                company: "Enterprise Solutions",
                location: "Jeddah, Saudi Arabia", 
                description: "Looking for an experienced Backend Developer...",
                requirements: ["Python", "Django", "PostgreSQL", "Docker"],
                salary: "18000-28000 SAR",
                type: "full-time",
                remote: true,
                url: "https://enterprise.com/jobs/backend",
                postedDate: new Date().toISOString(),
                matchScore: 0.82,
            }
        ];

        // TODO: Implement actual job board scraping/API calls
        // - LinkedIn Jobs API
        // - Indeed API  
        // - Local job boards (Bayt, GulfTalent, etc.)
        // - Company career pages

        return {
            jobs: mockJobs,
            totalFound: mockJobs.length,
            searchParams: args.searchParams,
        };
    }
});

// Step 4: Combine and rank all job results
export const aiCombineJobResults = internalAction({
    args: {
        jobResults: v.any(), // Results from step 3
        cvProfile: v.any(), // Original profile for matching
        searchParams: v.any(), // Search parameters used
    },
    handler: async (ctx, args): Promise<JobSearchResults> => {
        const agent = new Agent(components.agent, {
            chat: openai.chat("gpt-4o-mini"),
            instructions: `
            <agent>
  <name>JobRankingAgent</name>
  <description>
    An AI agent that intelligently ranks and filters job results based on user profile and preferences.
  </description>

  <goals>
    <goal>Rank jobs by relevance to user's profile and career goals</goal>
    <goal>Remove duplicate or low-quality job postings</goal>
    <goal>Calculate accurate match scores based on skills, experience, and preferences</goal>
    <goal>Provide personalized insights about each job opportunity</goal>
  </goals>

  <rules>
    <rule>Prioritize jobs that match user's skills and experience level</rule>
    <rule>Consider location preferences and remote work options</rule>
    <rule>Factor in salary expectations and career progression</rule>
    <rule>Remove obvious duplicates and spam postings</rule>
    <rule>Provide reasoning for job rankings and match scores</rule>
  </rules>
</agent>
            `,
            tools: {
                rankJobs: createTool({
                    description: "Rank and filter job results",
                    args: z.object({
                        ranked_jobs: z.array(z.object({
                            id: z.string(),
                            match_score: z.number().min(0).max(1),
                            match_reasons: z.array(z.string()),
                            concerns: z.array(z.string()).optional(),
                            recommendation: z.enum(["highly_recommended", "recommended", "consider", "not_recommended"]),
                        })),
                        insights: z.object({
                            total_relevant: z.number(),
                            avg_match_score: z.number(),
                            top_skills_in_demand: z.array(z.string()),
                            salary_insights: z.string(),
                            market_observations: z.string(),
                        }),
                    }),
                    handler: async (ctx, args) => {
                        return args;
                    }
                })
            },
            maxSteps: 3,
            maxRetries: 2,
        });

        const user = await ctx.runQuery(api.users.getMe);
        const thread = await agent.createThread(ctx, {
            userId: user?._id,
        });

        const result = ""// TODO: extract the result from the agent

        // For now, return the job results with mock ranking
        // In a real implementation, the agent would process and rank these
        const rankedJobs = args.jobResults.jobs.sort((a: JobResult, b: JobResult) => b.matchScore - a.matchScore);

        return {
            jobs: rankedJobs,
            totalFound: rankedJobs.length,
            insights: {
                total_relevant: rankedJobs.length,
                avg_match_score: 0.88,
                top_skills_in_demand: ["React", "TypeScript", "Node.js"],
                salary_insights: "Salaries range from 12,000 to 28,000 based on experience",
                market_observations: "Strong demand for full-stack developers in the region",
            },
            searchParams: args.searchParams,
        } as JobSearchResults;
    }
});

// Main workflow that orchestrates all steps
export const jobSearchWorkflow = workflow.define({
  args: {
    cv_storage_id: v.id("_storage"),
    userId: v.optional(v.id("users")),
  },
  handler: async (step, args): Promise<JobSearchResults> => {
    // Step 1: Parse CV and extract profile
    const cvProfile = await step.runAction(
        internal.jobSearch.aiParseCV,
        { 
            cv_storage_id: args.cv_storage_id,
            userId: args.userId 
        },
    );

    // Step 2: Tune job search parameters
    const searchParams = await step.runAction(
        internal.jobSearch.aiTuneJobSearch,
        { 
            cvProfile,
            userId: args.userId 
        },
    );

    // Step 3: Search for jobs
    const jobResults = await step.runAction(
        internal.jobSearch.aiSearchJobs,
        { 
            searchParams,
            cvProfile 
        },
    );

    // Step 4: Combine and rank results
    const finalResults = await step.runAction(
        internal.jobSearch.aiCombineJobResults,
        { 
            jobResults,
            cvProfile,
            searchParams 
        },
    );

    return finalResults;
  },
});
