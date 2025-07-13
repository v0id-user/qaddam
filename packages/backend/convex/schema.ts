import { defineSchema } from "convex/server";
import { authSchemas } from "./schemas/auth";
import { surveySchemas } from "./schemas/surveys";
import { jobSchemas } from "./schemas/jobs";
import { uploadSchemas } from "./schemas/uploads";
import { workflowStageSchemas } from "./schemas/workflowStage";

export default defineSchema({
	// Authentication tables
	...authSchemas,

	// Survey-related tables
	...surveySchemas,

	// Job-related tables
	...jobSchemas,

	// Upload-related tables
	...uploadSchemas,

	// Workflow-related tables
	...workflowStageSchemas,
});
