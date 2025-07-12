import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

// Workflow stage
export default defineSchema({
	workflowStage: defineTable({
		userId: v.id("users"),
		workflowId: v.string(),
		stage: v.string(),
	}),
});
