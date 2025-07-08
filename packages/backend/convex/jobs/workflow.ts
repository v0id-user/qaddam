import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobSearchResults } from "@/types/jobs";

export const workflow = new WorkflowManager(components.workflow);

// Main workflow that orchestrates all job search steps
export const jobSearchWorkflow = workflow.define({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.optional(v.id("users")),
	},
	handler: async (step, args): Promise<JobSearchResults> => {
		// Step 1: Parse CV and extract profile
		const cvProfile = await step.runAction(
			internal.jobs.actions.parse.aiParseCV,
			{
				cv_storage_id: args.cv_storage_id,
				userId: args.userId,
			},
		);

		// Step 2: Tune job search parameters
		const searchParams = await step.runAction(
			internal.jobs.actions.tuneSearch.aiTuneJobSearch,
			{
				cvProfile,
				userId: args.userId,
			},
		);

		// Step 3: Search for jobs
		const jobResults = await step.runAction(
			internal.jobs.actions.searchJobs.aiSearchJobs,
			{
				searchParams,
				cvProfile,
			},
		);

		// Step 4: Combine and rank results
		const finalResults = await step.runAction(
			internal.jobs.actions.combineResults.aiCombineJobResults,
			{
				jobResults,
				cvProfile,
				searchParams,
			},
		);

		return finalResults;
	},
});
