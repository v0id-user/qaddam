import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "@/_generated/api";
import { v } from "convex/values";
import { mutation } from "@/_generated/server";
import type { WorkflowId } from "@convex-dev/workflow";
export type { WorkflowId };

export const workflow = new WorkflowManager(components.workflow, {
	workpoolOptions: {
		// You must only set this to one value per components.xyz!
		// You can set different values if you "use" multiple different components
		// in convex.config.ts.
		maxParallelism: 10,
	},
});

// Main workflow that orchestrates all job search steps
export const jobSearchWorkflow = workflow.define({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.id("users"),
	},
	handler: async (
		step,
		args,
	): Promise<{
		saved: boolean;
		resultId: string;
	}> => {
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

		// Step 5: Save results
		const savedResults = await step.runAction(
			internal.jobs.actions.saveResults.aiSaveJobResults,
			{
				results: finalResults,
				userId: args.userId,
				cvStorageId: args.cv_storage_id,
				workflowId: step.workflowId,
			},
		);

		return savedResults;
	},
});

// Public mutation to start the job search workflow
export const startJobSearchWorkflow = mutation({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<WorkflowId> => {
		console.log("Starting job search workflow with CV:", args.cv_storage_id);

		const workflowId = await workflow.start(
			ctx,
			internal.jobs.workflow.jobSearchWorkflow,
			{
				cv_storage_id: args.cv_storage_id,
				userId: args.userId,
			},
		);

		console.log("Workflow started with ID:", workflowId);
		return workflowId;
	},
});

