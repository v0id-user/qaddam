import { v } from "convex/values";
import { query } from "./_generated/server";
import { workflow, WorkflowId } from "./jobs/workflow";
import chalk from "chalk";
import { api } from "./_generated/api";

export const getJobResults = query({
	args: { workflowId: v.string() },
	handler: async (ctx, { workflowId }) => {
		console.log(chalk.blue(`Getting job results for workflow ${workflowId}`));

		// Get the job search results record
		const searchResults = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
			.first();

		if (!searchResults) {
			console.log(
				chalk.yellow(`No search results found for workflow ${workflowId}`),
			);
			return null;
		}

		console.log(
			chalk.green(`Found search results record with ID ${searchResults._id}`),
		);

		// Get all job results for this search
		const jobResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", searchResults._id),
			)
			.collect();

		console.log(chalk.blue(`Retrieved ${jobResults.length} job results`));

		return {
			searchResults,
			jobResults,
		};
	},
});

// Simple status check using workflow.status
export const getWorkflowStatus = query({
	args: {
		workflowId: v.any(),
	},
	handler: async (ctx, args) => {
		console.log(chalk.blue(`Checking workflow status for ${args.workflowId}`));

		try {
			// Note: We'll use the workflowId as string for now and cast if needed
			const status = await workflow.status(ctx, args.workflowId as WorkflowId);

			console.log(
				chalk.green(`Workflow ${args.workflowId} status: ${status.type}`),
			);

			return {
				workflowId: args.workflowId,
				status: status.type,
			};
		} catch (error) {
			console.log(chalk.red("Error getting workflow status:", error));
			return {
				workflowId: args.workflowId,
				status: "error",
				result: null,
			};
		}
	},
});

export const getJobListing = query({
	args: {
		jobListingId: v.id("jobListings"),
	},
	handler: async (ctx, args) => {
		const user = ctx.runQuery(api.users.getMe);
		if (!user) {
			throw new Error("User not found unauthorized");
		}
		const jobListing = await ctx.db.get(args.jobListingId);
		if (!jobListing) {	
			throw new Error("Job listing not found");
		}
		return jobListing;
	},
});
