import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

// Workflow stage
export const workflowStageSchemas = {
	workflowStage: defineTable({
		userId: v.id("users"),
		workflowId: v.string(),
		stage: v.string(),
		percentage: v.number(),
		startedAt: v.number(),
		completedAt: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
		createdBy: v.id("users"),
		updatedBy: v.id("users"),
	}),
};
