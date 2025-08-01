import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import type { JobResult } from "../../types/jobs";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { batch_job_analysis_schema } from "../../lib/schemas/batch_job_analysis";
import type { JobType } from "../../types/jobs";

// Step 3: Search with the AI keywords
export const aiSearchJobs = internalAction({
	args: {
		userId: v.id("users"),
		searchParams: v.object({
			primary_keywords: v.array(v.string()),
			secondary_keywords: v.array(v.string()),
			search_terms: v.array(v.string()),
			job_title_keywords: v.array(v.string()),
			technical_skills: v.array(v.string()),
		}), // Tuned parameters from step 2
		cvProfile: v.object({
			skills: v.array(v.string()),
			experience_level: v.string(),
			job_titles: v.array(v.string()),
			industries: v.array(v.string()),
			keywords: v.array(v.string()),
			education: v.string(),
			years_of_experience: v.number(),
			preferred_locations: v.array(v.string()),
		}), // Original profile from step 1
		workflowTrackingId: v.string(),
		usageCount: v.number(),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobs: JobResult[];
		totalFound: number;
		searchParams: typeof args.searchParams;
	}> => {
		console.log("Starting job search:", {
			technicalSkills: args.searchParams.technical_skills.length,
			jobTitles: args.searchParams.job_title_keywords.length,
			yearsOfExperience: args.cvProfile.years_of_experience,
		});

		const [user] = await Promise.all([
			ctx.runQuery(internal.users.getUserById, { userId: args.userId }),
			ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "searching_jobs",
				percentage: 42,
				userId: args.userId,
			}),
		]);

		const { searchParams } = args;

		// OPTIMIZATION 1: Use only top 3 most relevant search terms to reduce API calls
		const searchStrategies = [
			// Strategy 1: Top technical skills (reduced from 3 to 2)
			...searchParams.technical_skills.slice(0, 2),
			// Strategy 2: Primary job title (reduced from 2 to 1)
			...searchParams.job_title_keywords.slice(0, 1),
		].filter((term) => term && term.trim().length > 2);

		console.log("Optimized search strategies:", {
			terms: searchStrategies.length,
			strategies: searchStrategies.slice(0, 3).join(", ") + "...",
		});

		// OPTIMIZATION 2: Run all database searches in parallel with 20 job limit per search
		console.log(
			`Running ${searchStrategies.length} parallel database searches (20 jobs each)...`,
		);
		const searchPromises = searchStrategies.map(async (searchTerm) => {
			console.log(`Parallel search: "${searchTerm.slice(0, 20)}..."`);
			return await ctx.runQuery(
				internal.listings.query.searchJobListingsUnused,
				{
					searchQuery: searchTerm.trim(),
					userId: args.userId,
					limit: user?.isPro ? 20 : 7,
				},
			);
		});

		const searchResults = await Promise.all(searchPromises);
		const allResults = searchResults.flat();

		console.log(
			`Parallel search completed: ${allResults.length} total results`,
		);

		// OPTIMIZATION 3: Single workflow update after all searches complete
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "searching_jobs",
			percentage: 52,
			userId: args.userId,
		});

		// Remove duplicates, shuffle, and limit to 20 jobs immediately
		const uniqueResults = allResults
			.filter(
				(job, index, self) =>
					index === self.findIndex((j) => j._id === job._id),
			)
			.sort(() => Math.random() - 0.5) // Shuffle randomly
			.slice(0, user?.isPro ? 20 : 7);

		console.log(
			`Search complete: ${uniqueResults.length} unique jobs (limited to 20) from ${allResults.length} total results`,
		);

		// OPTIMIZATION 4: Cache survey results and run parallel with job processing
		const [surveyResults] = await Promise.all([
			ctx.runQuery(internal.surveys.getSurveyResults, { userId: args.userId }),
			ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "processing_jobs",
				percentage: 55,
				userId: args.userId,
			}),
		]);

		// Extract survey data for AI analysis (optimized string building)
		const surveyData = surveyResults[0];
		const userSurveyInfo = surveyData
			? `USER: ${surveyData.profession} (${surveyData.experience}y, ${surveyData.careerLevel}) | Titles: ${surveyData.jobTitles.slice(0, 3).join(", ")} | Industries: ${surveyData.industries.slice(0, 3).join(", ")} | Work: ${surveyData.workType} | Locations: ${surveyData.locations.slice(0, 3).join(", ")} | Skills: ${surveyData.skills.slice(0, 8).join(", ")} | Companies: ${surveyData.companyTypes.slice(0, 3).join(", ")}`
			: "No survey data available";

		// Convert database results to JobResult format
		const jobResults: JobResult[] = [];
		console.log("Processing jobs for comprehensive AI analysis...");

		// OPTIMIZATION 5: Efficient job preprocessing (already limited to 20)
		const jobsToProcess = uniqueResults.map((job, index) => {
			// Pre-lowercase job text once
			const jobText = `${job.name} ${job.description}`.toLowerCase();

			// Improved skill matching with variations and logical inference
			const matchedSkills: string[] = [];
			const missingSkills: string[] = [];

			// Get all CV skills for logical inference
			const cvSkillsLower = args.cvProfile.skills.map((s) => s.toLowerCase());

			for (const skill of searchParams.technical_skills) {
				const skillLower = skill.toLowerCase();

				// Check for exact match
				if (jobText.includes(skillLower)) {
					matchedSkills.push(skill);
					continue;
				}

				// Check for common variations
				const skillVariations = [
					skillLower,
					skillLower.replace(/\.js$/, ""), // React.js -> React
					skillLower.replace(/\.js$/, ".js"), // React -> React.js
					skillLower.replace(/\s+/g, ""), // "Machine Learning" -> "MachineLearning"
					skillLower.replace(/\s+/g, "-"), // "Machine Learning" -> "Machine-Learning"
					skillLower.replace(/\s+/g, "_"), // "Machine Learning" -> "Machine_Learning"
				];

				const isMatched = skillVariations.some(
					(variation) =>
						jobText.includes(variation) ||
						jobText.includes(variation + " ") ||
						jobText.includes(" " + variation),
				);

				if (isMatched) {
					matchedSkills.push(skill);
					continue;
				}

				// LOGICAL INFERENCE: Check if CV has advanced skills that imply this basic skill
				let isImplied = false;

				// Web fundamentals inference
				if (
					[
						"html",
						"html5",
						"css",
						"css3",
						"javascript",
						"rest",
						"api",
						"restful",
					].includes(skillLower)
				) {
					const hasWebFrameworks = cvSkillsLower.some((cvSkill) =>
						[
							"react",
							"nextjs",
							"next.js",
							"vue",
							"angular",
							"svelte",
							"nuxt",
						].includes(cvSkill.replace(/[.\s]/g, "")),
					);
					if (hasWebFrameworks) {
						isImplied = true;
					}
				}

				// JavaScript inference
				if (["javascript", "js"].includes(skillLower)) {
					const hasJSFrameworks = cvSkillsLower.some((cvSkill) =>
						[
							"react",
							"vue",
							"angular",
							"node",
							"typescript",
							"nextjs",
						].includes(cvSkill.replace(/[.\s]/g, "")),
					);
					if (hasJSFrameworks) {
						isImplied = true;
					}
				}

				if (isImplied) {
					matchedSkills.push(skill);
				} else {
					missingSkills.push(skill);
				}
			}

			// Add this after skill matching to debug issues
			console.log("Skill matching debug:", {
				jobTitle: job.name,
				totalSkills: searchParams.technical_skills.length,
				matchedSkills: matchedSkills.length,
				missingSkills: missingSkills.length,
				matchedSkillsList: matchedSkills,
				missingSkillsList: missingSkills,
			});

			return {
				job,
				index,
				matchedSkills,
				missingSkills,
			};
		});

		// OPTIMIZATION 6: Reduce AI batch size for faster response time
		const BATCH_SIZE = user?.isPro ? 10 : 7;
		const chunks = [];
		for (let i = 0; i < jobsToProcess.length; i += BATCH_SIZE) {
			chunks.push(jobsToProcess.slice(i, i + BATCH_SIZE));
		}

		console.log(
			`Processing ${jobsToProcess.length} jobs in ${chunks.length} batches of ${BATCH_SIZE} (optimized for speed)`,
		);

		// OPTIMIZATION 7: Minimize workflow updates - only update every 2nd batch
		let lastProgressUpdate = 55;

		// Process each chunk with batch AI analysis
		for (const [chunkIndex, chunk] of chunks.entries()) {
			console.log(
				`Processing batch ${chunkIndex + 1}/${chunks.length} (${chunk.length} jobs)...`,
			);

			// Prepare full batch data for AI analysis (no reduction)
			const batchJobData = chunk.map(
				({ job, matchedSkills, missingSkills }) => ({
					id: job._id,
					title: job.name,
					desc: job.description,
					location: job.location || "Remote",
					matched: matchedSkills.join(","),
					missing: missingSkills.join(","),
				}),
			);

			// Update the AI prompt to include full CV skills for comparison
			// If the user is pro and has less than 10 searches, use gpt-4o, otherwise use gpt-4o-mini
			const batchAnalysis = await generateObject({
				model: openai.chat(
					user?.isPro && args.usageCount < 10 ? "gpt-4o" : "gpt-4o-mini",
					{
						structuredOutputs: true,
					},
				),
				messages: [
					{
						role: "system",
						content: `Analyze job-candidate fit with precise scoring. 

CRITICAL: Base your analysis ONLY on the provided CV data and survey information. READ THE ACTUAL RESUME CONTENT CAREFULLY.

ADVANCED EXPERIENCE ANALYSIS:
You must carefully read and analyze the actual resume/CV content to determine experience type:

1. PROFESSIONAL WORK EXPERIENCE (Highest Value):
   - ACTUAL company names mentioned (Google, Microsoft, Acme Corp, etc.)
   - ACTUAL job titles with company context (Software Engineer at XYZ, Developer at ABC)
   - Employment dates with company context
   - Internships at established companies with company names

2. FREELANCE/CONTRACT EXPERIENCE (High Value):
   - ACTUAL client work mentioned with client names
   - Project-based work with real deliverables and clients
   - Freelance platforms mentioned (Upwork, Fiverr)
   - Contract roles with company/client names

3. PERSONAL PROJECTS/SELF-LEARNING (Entry-Level Value):
   - GitHub projects with github.com links
   - Personal websites and portfolio projects
   - NO company or client names mentioned
   - Self-taught skills demonstrated through personal projects
   - Projects with dates but no employment context

4. ACADEMIC/EDUCATIONAL EXPERIENCE (Context-Dependent):
   - University projects, thesis work
   - Research experience
   - Academic publications

RESUME CONTENT VERIFICATION:
- If you see "github.com/username/project" → this is a PERSONAL PROJECT
- If you see company names in work history → this is PROFESSIONAL EXPERIENCE  
- If you see only project descriptions without company context → these are PERSONAL PROJECTS
- Years spent on personal projects ≠ years of professional experience

EXPERIENCE MATCH SCORING (0-1):
- 0.9-1.0: Perfect match - candidate's PROFESSIONAL experience exactly matches job requirements
- 0.7-0.8: Strong match - candidate has relevant PROFESSIONAL/FREELANCE experience with minor gaps
- 0.5-0.6: Moderate match - candidate has some PROFESSIONAL experience OR strong personal projects + skills
- 0.3-0.4: Weak match - candidate has mostly personal projects/self-learning with some relevant skills
- 0.1-0.2: Poor match - significant gaps in experience type and requirements
- 0.0: Complete mismatch - no relevant experience of any type

SCORING CONSISTENCY RULES:
- If location score is 0.4 and missing 6+ critical skills → overall score should be 0.2-0.4 maximum
- If experience is "personal projects only" for mid/senior role → cap at 0.5 maximum
- If 80% of required skills are missing → cap at 0.3 maximum
- Be HARSH on scoring - better to under-score than over-score

SPECIFIC EXPERIENCE CONSIDERATIONS:
- Entry-level/Intern jobs: Score 0.6-0.8 for candidates with personal projects + relevant skills (even 0 professional experience)
- Junior roles (1-3y): Require some professional/freelance experience OR strong personal projects + education
- Mid-level roles (3-5y): Require clear professional experience with company names/client work
- Senior roles (5+y): Require extensive professional experience with leadership/project management indicators
- If CV mentions company names, treat as professional experience
- If CV only mentions personal projects/GitHub, treat as self-learning experience
- Consider career changers: Strong personal projects + education can offset lack of professional experience in new field

LOCATION MATCH SCORING (0-1):
- 1.0: Exact location match or candidate explicitly mentions this location
- 0.8: Same city/region or candidate shows willingness to relocate
- 0.6: Same country or candidate has remote work experience
- 0.4: Different country but remote-friendly role
- 0.2: Different country, on-site role, no relocation mentioned
- 0.0: Complete location mismatch with no remote option

SKILL MATCHING ADVANCED CRITERIA:
Compare job requirements with candidate's full skill set using LOGICAL INFERENCE:

CRITICAL SKILL INFERENCE RULES:
- React/Next.js → AUTOMATICALLY includes HTML5, CSS3, JavaScript, RESTful APIs, DOM manipulation
- Vue.js/Angular → AUTOMATICALLY includes HTML5, CSS3, JavaScript, RESTful APIs, SPA concepts
- Node.js/Express → AUTOMATICALLY includes JavaScript, RESTful APIs, HTTP protocols, JSON
- Full-stack frameworks → AUTOMATICALLY includes both frontend and backend fundamentals
- Mobile development (React Native/Flutter) → AUTOMATICALLY includes API integration, state management
- Any web framework → AUTOMATICALLY includes web fundamentals (HTML, CSS, HTTP, REST)

SKILL MATCHING CRITERIA:
- EXACT MATCHES: Direct skill mentions in CV (highest weight)
- LOGICAL INFERENCE: If CV shows React → candidate knows HTML5, CSS3, REST APIs (don't mark as missing!)
- RELATED SKILLS: Connected technologies (React ecosystem, AWS services)
- SKILL VARIATIONS: Different names for same technology (JS/JavaScript, ML/Machine Learning)
- TRANSFERABLE SKILLS: Skills that indicate learning ability
- DEPTH INDICATORS: Years mentioned, project complexity, professional usage

CRITICAL: Do NOT mark fundamental web skills as "missing" if candidate has advanced frameworks that require them!

EXAMPLE:
Job requires: "HTML5, CSS3, JavaScript, REST APIs"
CV shows: "React, Next.js, TypeScript"
CORRECT: All job requirements are MET (React implies HTML5/CSS3/JS/REST)
WRONG: Marking HTML5, CSS3, REST APIs as "missing skills"

HOLISTIC EVALUATION:
Consider ALL factors together:
- A candidate with 2 years professional experience + perfect skill match = 0.8-0.9
- A candidate with 5 years personal projects + good skills + no professional experience = 0.4-0.6 for mid-level roles, 0.6-0.8 for entry-level
- A career changer with strong education + personal projects + transferable skills = 0.5-0.7 for entry-level roles
- Consider growth potential, learning indicators, and cultural fit signals

Provide detailed match reasons and specific experience gaps based ONLY on provided data.`,
					},
					{
						role: "user",
						content: `CANDIDATE PROFILE:
${userSurveyInfo}

CV DETAILS:
Experience: ${args.cvProfile.experience_level} (${args.cvProfile.years_of_experience} years)
ALL CV Skills: ${args.cvProfile.skills.join(", ")}
Preferred Locations: ${args.cvProfile.preferred_locations.join(", ")}

JOBS TO ANALYZE:
${batchJobData.map((job, idx) => `${idx + 1}. ${job.title} @${job.location} | ${job.desc} | Pre-matched Skills: ${job.matched} | Pre-missing Skills: ${job.missing}`).join("\n")}

CRITICAL INSTRUCTIONS: 
1. EXPERIENCE TYPE ANALYSIS - READ THE ACTUAL RESUME CONTENT:
   - Look for COMPANY NAMES in employment history (Google, Microsoft, etc.)
   - Look for JOB TITLES with companies (Software Engineer at XYZ Corp)
   - Look for CLIENT WORK or freelance contracts
   - If you only see GITHUB PROJECTS with dates → these are PERSONAL PROJECTS, not professional experience
   - Personal project dates (2024-2025) with GitHub links = 0-1 years self-learning, NOT professional experience

2. The CV shows ${args.cvProfile.years_of_experience} years but VERIFY THE ACTUAL CONTENT:
   - If resume only shows personal projects with GitHub links → treat as 0-1 years SELF-LEARNING experience
   - If resume shows company names and job titles → treat as professional experience
   - DO NOT assume years without verifying the content type
   - Personal projects ≠ Professional experience, even if spanning multiple years

3. SKILL ANALYSIS - READ WHAT'S ACTUALLY LISTED:
   - If the CV/resume mentions a skill in project descriptions → candidate HAS that skill
   - If a skill appears in multiple projects → candidate has STRONG experience with it
   - DO NOT contradict yourself: If you say candidate has strong Python skills, don't list Python as "Areas to Consider"
   - BE CONSISTENT: Skills mentioned in projects = skills the candidate possesses

4. CONSISTENT SCORING LOGIC:
   - Personal projects only + Location mismatch + Missing advanced skills = MAX 0.4 score
   - Personal projects + Perfect skill match + Good location = 0.5-0.7 score
   - Professional experience + Good skills + Good location = 0.7-0.9 score
   - Be CONSISTENT across all scoring dimensions

5. LOGICAL SKILL INFERENCE: Use common sense when evaluating skills:
   - If CV mentions React/Next.js → candidate KNOWS HTML5, CSS3, JavaScript, REST APIs
   - If CV mentions Vue/Angular → candidate KNOWS web fundamentals
   - If CV mentions Node.js → candidate KNOWS JavaScript, REST APIs, HTTP
   - Do NOT mark basic skills as "missing" when candidate has advanced skills that require them
   - Focus on genuinely missing advanced skills, not foundational ones

6. DETAILED ANALYSIS REQUIRED:
   - Always provide specific experience_gaps in the experience analysis
   - Always provide detailed match_reasons for both experience and location
   - Never leave fields empty or say "Not Specified"
   - Be factual and accurate about what the resume actually contains

7. AVOID CONTRADICTIONS:
   - If you say candidate has "strong TypeScript skills" don't list TypeScript as missing
   - If you identify personal projects, don't claim "professional experience"
   - If location doesn't match, don't give "Highly Recommended" unless skills are exceptional

8. Consider the user's survey preferences (career level, industries, work type, company types) when scoring job matches.

9. HOLISTIC EVALUATION: Balance ALL factors - don't over-score if multiple dimensions are weak.`,
					},
					{
						role: "user",
						content: `OUTPUT FORMAT REQUIREMENTS:
For each job analysis, you must include:
- matched_skills: array of specific skills/technologies from the job requirements that the candidate already possesses based on their CV (max 15 items)
- missing_skills: array of the most relevant specific skills/technologies the candidate should consider learning to better match this particular job (max 15 items, focus on job-specific requirements only)

CRITICAL: Only include skills that are actually mentioned in the job description or are directly relevant to the specific role. Do not include generic skills or technologies not related to this particular job posting.`,
					},
				],
				schema: batch_job_analysis_schema,
			});

			console.log(
				`AI Batch Analysis [Batch ${chunkIndex + 1}] - Token usage:`,
				{
					promptTokens: batchAnalysis.usage?.promptTokens || 0,
					completionTokens: batchAnalysis.usage?.completionTokens || 0,
					totalTokens: batchAnalysis.usage?.totalTokens || 0,
				},
			);

			// Process batch results
			const batchData = batchAnalysis.object as {
				jobAnalyses: Array<{
					jobId: string;
					experienceMatch: {
						match_level: "perfect" | "good" | "partial" | "poor" | "mismatch";
						match_score: number;
						match_reasons: string[];
						experience_gaps: string[];
						recommendation: string;
					};
					locationMatch: {
						match_score: number;
						match_reasons: string[];
						work_type_match: string;
					};
					benefits: string[];
					requirements: string[];
					dataExtraction: {
						salary: {
							is_salary_mentioned: boolean;
							min: number | null;
							max: number | null;
							currency: string;
						};
						company: {
							is_company_mentioned: boolean;
							name: string | null;
						};
						job_type: {
							type: string;
						};
					};
					matched_skills: string[];
					missing_skills: string[];
				}>;
			};

			const batchResults: JobResult[] = [];

			// OPTIMIZATION 10: Efficient batch result processing
			for (
				let batchIdx = 0;
				batchIdx < batchData.jobAnalyses.length;
				batchIdx++
			) {
				const analysis = batchData.jobAnalyses[batchIdx];
				const originalJob = chunk[batchIdx];
				if (!originalJob) continue;

				const { job, matchedSkills, missingSkills } = originalJob;

				// OPTIMIZATION 11: Simplified location matching
				let locationMatch = "no_location_provided";
				if (args.cvProfile.preferred_locations.length > 0) {
					const jobLocation = (job.location || "").toLowerCase();
					locationMatch = args.cvProfile.preferred_locations.some((location) =>
						jobLocation.includes(location.toLowerCase()),
					)
						? "location_match"
						: "location_mismatch";
				}

				// Log analysis for debugging
				console.log(`Job ${job.name} analysis:`, {
					experienceScore: analysis.experienceMatch.match_score,
					experienceLevel: analysis.experienceMatch.match_level,
					locationScore: analysis.locationMatch.match_score,
					aiMatchedSkills: (analysis.matched_skills || []).length,
					aiMissingSkills: (analysis.missing_skills || []).length,
					experienceGaps: analysis.experienceMatch.experience_gaps.length,
				});

				// Use AI-provided matched/missing skills when available
				const aiMatchedSkills = analysis.matched_skills || matchedSkills;
				const aiMissingSkills = analysis.missing_skills || missingSkills;

				const jobResult: JobResult = {
					jobListingId: job._id,
					// Benefits - now directly as string array
					benefits: analysis.benefits,
					// Requirements - now directly as string array
					requirements: analysis.requirements,
					// Use AI-derived matched/missing skills for accuracy
					matchedSkills: aiMatchedSkills,
					missingSkills: aiMissingSkills,
					// Experience matching
					experienceMatch: analysis.experienceMatch.match_level,
					experienceMatchScore: analysis.experienceMatch.match_score,
					experienceMatchReasons: analysis.experienceMatch.match_reasons,
					// Add experience gaps to the result
					experienceGaps: analysis.experienceMatch.experience_gaps,
					// Location matching
					locationMatchScore: analysis.locationMatch.match_score,
					locationMatchReasons: analysis.locationMatch.match_reasons,
					locationMatch,
					workTypeMatch: ["remote", "hybrid", "onsite"].includes(
						(analysis.locationMatch.work_type_match || "").toLowerCase(),
					),
					// Data extraction (for use in combineResults)
					extractedData: {
						salary: analysis.dataExtraction.salary,
						company: analysis.dataExtraction.company,
						jobType: {
							type: (analysis.dataExtraction.job_type.type as JobType) || null,
							is_remote: false,
							work_arrangement: null,
						},
					},
				};

				batchResults.push(jobResult);
			}

			jobResults.push(...batchResults);

			// OPTIMIZATION 12: Reduce progress updates frequency - only update every 2nd batch or at end
			const shouldUpdateProgress =
				chunkIndex % 2 === 0 || chunkIndex === chunks.length - 1;
			if (shouldUpdateProgress) {
				const batchCompleteProgress =
					55 + Math.round(((chunkIndex + 1) / chunks.length) * 20);
				if (batchCompleteProgress > lastProgressUpdate) {
					lastProgressUpdate = batchCompleteProgress;
					await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
						workflowId: args.workflowTrackingId,
						stage: "processing_jobs",
						percentage: batchCompleteProgress,
						userId: args.userId,
					});
				}
			}

			console.log(
				`Batch ${chunkIndex + 1}/${chunks.length} completed (${jobResults.length} total processed)`,
			);
		}

		// Update workflow status to indicate all batches completed
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "jobs_processed",
			percentage: 75,
			userId: args.userId,
		});

		// OPTIMIZATION 13: Return all processed results (already limited to 20)
		const finalResults = jobResults;
		const avgScore =
			finalResults.length > 0
				? (
						finalResults.reduce(
							(sum, job) => sum + job.experienceMatchScore,
							0,
						) / finalResults.length
					).toFixed(2)
				: "0.00";

		console.log(
			`✅ Optimized search completed: ${finalResults.length} jobs, avg score: ${avgScore}`,
		);

		return {
			jobs: finalResults,
			totalFound: jobResults.length,
			searchParams: args.searchParams,
		};
	},
});
