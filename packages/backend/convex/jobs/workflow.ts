import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobSearchResults } from "@/types/jobs";
import { mutation, query } from "@/_generated/server";
import { WorkflowId } from "@convex-dev/workflow";

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

// Simple status check using workflow.status
export const getWorkflowStatus = mutation({
	args: {
		workflowId: v.string(),
	},
	handler: async (ctx, args) => {
		try {
			// Note: We'll use the workflowId as string for now and cast if needed
			const status = await workflow.status(ctx, args.workflowId as any);

			return {
				workflowId: args.workflowId,
				status: status.type,
			};
		} catch (error) {
			console.error("Error getting workflow status:", error);
			return {
				workflowId: args.workflowId,
				status: "error",
				result: null,
			};
		}
	},
});

// Simple progress check for UI
export const getWorkflowProgress = query({
	args: {
		workflowId: v.string(),
	},
	handler: async (ctx, args) => {
		// For now, return a simple mock progress structure
		// This will be updated once the workflow is working
		const stepNames = [
			"aiParseCV",
			"aiTuneJobSearch",
			"aiSearchJobs",
			"aiCombineJobResults",
			"aiSaveJobResults",
		];

		const steps = stepNames.map((stepName, index) => ({
			key: stepName,
			status: "not_started" as const,
			stepNumber: index,
		}));

		return {
			workflowId: args.workflowId,
			steps,
			isComplete: false,
			isError: false,
			result: null,
			error: null,
		};
	},
});
