import { query } from "../_generated/server";
import { v } from "convex/values";
import { workflow, WorkflowId } from "./workflow";

export const getJobResults = query({
  args: { workflowId: v.string() },
  handler: async (ctx, { workflowId }) => {
    // Get the job search results record
    const searchResults = await ctx.db
      .query("jobSearchResults")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
      .first();

    if (!searchResults) {
      return null;
    }

    // Get all job results for this search
    const jobResults = await ctx.db
      .query("jobSearchJobResults")
      .withIndex("by_search_results", (q) => 
        q.eq("jobSearchResultsId", searchResults._id)
      )
      .collect();

    return {
      searchResults,
      jobResults
    };
  }
});


// Simple status check using workflow.status
export const getWorkflowStatus = query({
	args: {
		workflowId: v.any(),
	},
	handler: async (ctx, args) => {
		try {
			// Note: We'll use the workflowId as string for now and cast if needed
			const status = await workflow.status(ctx, args.workflowId as WorkflowId);

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

