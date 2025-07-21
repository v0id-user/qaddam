import { WorkflowManager } from "@convex-dev/workflow";
import { api, components, internal } from "../_generated/api";
import { v } from "convex/values";
import { action } from "../_generated/server";
import type { WorkflowId } from "@convex-dev/workflow";
import rateLimiter from "../ratelimiter";
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
		workflowTrackingId: v.string(),
	},
	handler: async (
		step,
		args,
	): Promise<{
		saved: boolean;
		resultId: string;
	}> => {
		// Step 1: Parse CV and extract profile (20%)
		const cvProfile = await step.runAction(
			internal.jobs.actions.parse.aiParseCV,
			{
				cv_storage_id: args.cv_storage_id,
				userId: args.userId,
				workflowTrackingId: args.workflowTrackingId,
			},
		);

		// Step 2: Tune job search parameters (40%)
		const searchParams = await step.runAction(
			internal.jobs.actions.tuneSearch.aiTuneJobSearch,
			{
				cvProfile,
				userId: args.userId,
				workflowTrackingId: args.workflowTrackingId,
			},
		);

		// Step 3: Search for jobs (60%)
		const jobResults = await step.runAction(
			internal.jobs.actions.searchJobs.aiSearchJobs,
			{
				searchParams,
				cvProfile,
				userId: args.userId,
				workflowTrackingId: args.workflowTrackingId,
			},
		);

		// Step 4: Combine and rank results (80%)
		const finalResults = await step.runAction(
			internal.jobs.actions.combineResults.aiCombineJobResults,
			{
				jobResults,
				cvProfile,
				searchParams,
				userId: args.userId,
				workflowTrackingId: args.workflowTrackingId,
			},
		);

		// Step 5: Save results (100%)
		const savedResults = await step.runAction(
			internal.jobs.actions.saveResults.aiSaveJobResults,
			{
				results: finalResults,
				userId: args.userId,
				cvStorageId: args.cv_storage_id,
				workflowId: step.workflowId,
				workflowTrackingId: args.workflowTrackingId,
			},
		);

		return savedResults;
	},
});

// Public mutation to start the job search workflow
export const startJobSearchWorkflow = action({
	args: {
		cv_storage_id: v.id("_storage"),
	},
	handler: async (
		ctx,
		args,
	): Promise<{ workflowTrackingId: string; workflowId: WorkflowId }> => {
		const me = await ctx.runQuery(api.users.getMe);
		console.log("Starting job search workflow with CV:", {
			cv_storage_id: args.cv_storage_id,
		});

		if (!me?.isPro) {
			const { ok, retryAfter } = await rateLimiter.limit(
				ctx,
				"freeTrialSignUp",
			);
			if (!ok) {
				throw new Error(
					`Rate limit exceeded, retry after ${retryAfter} seconds`,
				);
			}
		} else {
			const { ok, retryAfter } = await rateLimiter.limit(ctx, "proLimit");
			if (!ok) {
				throw new Error(
					`Rate limit exceeded, retry after ${retryAfter} seconds`,
				);
			}
		}

		// Create a tracking id for the workflow
		const workflowTrackingId = await ctx.runMutation(
			internal.workflow_status.workflowEntryInitial,
			{
				userId: me?._id!,
			},
		);

		const workflowId = await workflow.start(
			ctx,
			internal.jobs.workflow.jobSearchWorkflow,
			{
				cv_storage_id: args.cv_storage_id,
				userId: me?._id!,
				workflowTrackingId,
			},
		);

		// Fire a scheduler to add new jobs listing based on user survey only if user is pro
		if (me?.isPro) {
			// await ctx.scheduler.runAfter(
			// 	5000,
			// 	internal.listings.action.addNewJobsListingAction,
			// 	{
			// 		userId: me?._id!,
			// 	},
			// );
		}
		console.log("Workflow started with ID:", { workflowId });
		return { workflowTrackingId, workflowId };
	},
});
