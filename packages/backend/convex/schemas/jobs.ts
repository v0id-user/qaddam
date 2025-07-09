import { defineTable } from "convex/server";
import { v } from "convex/values";

export const jobSchemas = {
	jobListings: defineTable({
		// Basic job details
		name: v.string(),
		description: v.string(),
		location: v.optional(v.string()),
		salary: v.optional(v.number()),
		currency: v.optional(v.string()),

		// Source metadata
		source: v.optional(v.string()),
		sourceId: v.optional(v.string()),
		datePosted: v.optional(v.number()),
		sourceUrl: v.optional(v.string()),

		// Source company details
		sourceName: v.optional(v.string()),
		sourceLogo: v.optional(v.string()),
		sourceDescription: v.optional(v.string()),
		sourceLocation: v.optional(v.string()),
	})
		.searchIndex("search_description", {
			searchField: "description",
			filterFields: ["location", "source", "sourceName"],
		})
		.searchIndex("search_name", {
			searchField: "name",
			filterFields: ["location", "source", "sourceName"],
		}),

	// User job applications tracking
	userApplications: defineTable({
		userId: v.id("users"),
		jobPostId: v.id("jobPosts"),
		appliedAt: v.number(),
		status: v.string(), // "applied", "viewed", "interview", "rejected", "offer"
		notes: v.optional(v.string()),
		matchScore: v.optional(v.number()), // AI-calculated match percentage
	})
		.index("by_user", ["userId"])
		.index("by_job", ["jobPostId"])
		.index("by_user_and_job", ["userId", "jobPostId"])
		.index("by_status", ["status"])
		.index("by_applied_date", ["appliedAt"]),

	// User saved jobs
	savedJobs: defineTable({
		userId: v.id("users"),
		jobPostId: v.id("jobPosts"),
		savedAt: v.number(),
		notes: v.optional(v.string()),
	})
		.index("by_user", ["userId"])
		.index("by_job", ["jobPostId"])
		.index("by_user_and_job", ["userId", "jobPostId"])
		.index("by_saved_date", ["savedAt"]),

	// Job search results storage
	jobSearchResults: defineTable({
		userId: v.id("users"),
		cvStorageId: v.id("_storage"),
		workflowId: v.string(),

		// Results data
		totalFound: v.number(),

		// Insights
		totalRelevant: v.number(),
		avgMatchScore: v.number(),
		topSkillsInDemand: v.array(v.string()),
		salaryInsights: v.string(),
		marketObservations: v.string(),

		// Search parameters used
		optimizedKeywords: v.array(v.string()),
		targetJobTitles: v.array(v.string()),
		targetCompanies: v.array(v.string()),
		salaryRangeMin: v.number(),
		salaryRangeMax: v.number(),
		salaryRangeCurrency: v.string(),
		preferredJobTypes: v.array(v.string()),
		locations: v.array(v.string()),
		searchStrategy: v.string(),

		// Metadata
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_workflow", ["workflowId"])
		.index("by_cv_storage", ["cvStorageId"])
		.index("by_created_date", ["createdAt"]),

	// Individual job results from search
	jobSearchJobResults: defineTable({
		jobSearchResultsId: v.id("jobSearchResults"),

		// Basic job info
		externalId: v.string(),
		title: v.string(),
		company: v.string(),
		location: v.string(),
		description: v.string(),
		requirements: v.array(v.string()),
		salary: v.optional(v.string()),
		type: v.string(), // JobType
		remote: v.boolean(),
		url: v.string(),
		postedDate: v.string(),
		matchScore: v.number(),

		// AI Analysis
		benefits: v.array(v.string()),
		matchedSkills: v.array(v.string()),
		missingSkills: v.array(v.string()),
		experienceMatch: v.string(),
		locationMatch: v.string(),

		// AI Ranking
		aiMatchReasons: v.optional(v.array(v.string())),
		aiConcerns: v.optional(v.array(v.string())),
		aiRecommendation: v.optional(v.string()),

		// Metadata
		createdAt: v.number(),
	})
		.index("by_search_results", ["jobSearchResultsId"])
		.index("by_match_score", ["matchScore"])
		.index("by_recommendation", ["aiRecommendation"])
		.index("by_created_date", ["createdAt"]),
};
