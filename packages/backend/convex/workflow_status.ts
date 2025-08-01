import { internalMutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { workflow } from "./jobs/workflow";

export const getWorkflowStatus = query({
	args: {
		workflowTrackingId: v.string(),
		workflowId: v.any(),
	},
	handler: async (ctx, args) => {
		const workflowStatus = await ctx.db
			.query("workflowStage")
			.filter((q) => q.eq(q.field("workflowId"), args.workflowTrackingId))
			.take(1);
		const user = await ctx.runQuery(api.users.getMe);
		if (!workflowStatus.length) {
			return null;
		}
		if (workflowStatus[0].userId !== user?._id) {
			throw new Error("Unauthorized access to workflow status");
		}
		const status = await workflow.status(ctx, args.workflowId);
		return {
			...workflowStatus[0],
			status: status,
		};
	},
});

export const updateWorkflowStage = internalMutation({
	args: {
		workflowId: v.string(),
		stage: v.string(),
		percentage: v.number(),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const workflowStage = await ctx.db
			.query("workflowStage")
			.filter((q) => q.eq(q.field("workflowId"), args.workflowId))
			.first();

		if (!workflowStage) {
			throw new Error("Workflow stage not found");
		}

		await ctx.db.patch(workflowStage._id, {
			stage: args.stage,
			percentage: args.percentage,
			updatedAt: now,
			updatedBy: args.userId,
			completedAt: args.percentage === 100 ? now : workflowStage.completedAt,
		});
	},
});

export const workflowEntryInitial = internalMutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		// Create initial workflow stage record
		const now = Date.now();
		const workflowTrackingId = crypto.randomUUID();
		await ctx.db.insert("workflowStage", {
			userId: args.userId,
			workflowId: workflowTrackingId,
			stage: "initial",
			percentage: 0,
			startedAt: now,
			completedAt: 0,
			createdAt: now,
			updatedAt: now,
			createdBy: args.userId,
			updatedBy: args.userId,
		});

		return workflowTrackingId;
	},
});
