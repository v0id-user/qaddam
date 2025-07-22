import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// ===== CV UPLOADS QUERIES =====

// Get all CV uploads for current user (including inactive)
export const getUserCVUploads = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("cvUploads")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

// Get only active CV uploads for current user
export const getUserActiveCVUploads = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("cvUploads")
			.withIndex("by_user_active", (q) =>
				q.eq("userId", userId).eq("isActive", true),
			)
			.order("desc")
			.collect();
	},
});

// Get CV upload by ID with user security check
export const getUserCVUploadById = query({
	args: { cvId: v.id("cvUploads") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const cv = await ctx.db.get(args.cvId);
		if (!cv || cv.userId !== userId) {
			throw new Error("CV not found or access denied");
		}

		return cv;
	},
});

// ===== JOB SEARCH RESULTS QUERIES =====

// Get all job search results for current user
export const getUserJobSearchResults = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("jobSearchResults")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

// Get job search results with basic stats
export const getUserJobSearchResultsWithStats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const searchResults = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		// For each search result, get the count of job results
		const resultsWithStats = await Promise.all(
			searchResults.map(async (result) => {
				const jobResultsCount = await ctx.db
					.query("jobSearchJobResults")
					.withIndex("by_search_results", (q) =>
						q.eq("jobSearchResultsId", result._id),
					)
					.collect();

				return {
					...result,
					jobResultsCount: jobResultsCount.length,
				};
			}),
		);

		return resultsWithStats;
	},
});

// Get specific job search result by workflow ID with user security check
export const getUserJobSearchResultByWorkflow = query({
	args: { workflowId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const searchResult = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
			.first();

		if (!searchResult || searchResult.userId !== userId) {
			throw new Error("Job search result not found or access denied");
		}

		return searchResult;
	},
});

// Get job results for a specific search with user security check
export const getUserJobResultsForSearch = query({
	args: { jobSearchResultsId: v.id("jobSearchResults") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		// First verify the search result belongs to the user
		const searchResult = await ctx.db.get(args.jobSearchResultsId);
		if (!searchResult || searchResult.userId !== userId) {
			throw new Error("Job search result not found or access denied");
		}

		return await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", args.jobSearchResultsId),
			)
			.collect();
	},
});

// Get all job results for current user across all searches
export const getUserAllJobResults = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

// ===== USER APPLICATIONS QUERIES =====

// Get all user applications
export const getUserApplications = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("userApplications")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

// Get user applications by status
export const getUserApplicationsByStatus = query({
	args: { status: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const allApplications = await ctx.db
			.query("userApplications")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		return allApplications.filter((app) => app.status === args.status);
	},
});

// ===== SAVED JOBS QUERIES =====

// Get all saved jobs for current user
export const getUserSavedJobs = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("savedJobs")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

// Check if a job is saved by current user
export const isJobSavedByUser = query({
	args: { jobPostId: v.id("jobListings") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return false;

		const savedJob = await ctx.db
			.query("savedJobs")
			.withIndex("by_user_and_job", (q) =>
				q.eq("userId", userId).eq("jobPostId", args.jobPostId),
			)
			.first();

		return !!savedJob;
	},
});

// ===== USER SURVEYS QUERIES =====

// Get current user's survey (re-export from surveys.ts for consistency)
export const getUserSurvey = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		return await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();
	},
});

// Check if current user has completed survey
export const hasUserCompletedSurvey = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return false;

		const survey = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		return !!survey;
	},
});

// ===== COMPREHENSIVE DASHBOARD DATA =====

// Get complete user dashboard data in one query
export const getUserDashboardData = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		// Get all user data in parallel
		const [
			cvUploads,
			jobSearchResults,
			allJobResults,
			applications,
			savedJobs,
			survey,
		] = await Promise.all([
			ctx.db
				.query("cvUploads")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.collect(),
			ctx.db
				.query("jobSearchResults")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.collect(),
			ctx.db
				.query("jobSearchJobResults")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.take(50), // Limit to recent 50 for performance
			ctx.db
				.query("userApplications")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.take(50),
			ctx.db
				.query("savedJobs")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.take(50),
			ctx.db
				.query("userSurveys")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.first(),
		]);

		// Calculate stats
		const stats = {
			totalCVUploads: cvUploads.length,
			activeCVUploads: cvUploads.filter((cv) => cv.isActive).length,
			totalJobSearches: jobSearchResults.length,
			totalJobsFound: jobSearchResults.reduce(
				(sum, result) => sum + result.totalFound,
				0,
			),
			totalApplications: applications.length,
			totalSavedJobs: savedJobs.length,
			hasSurvey: !!survey,
		};

		return {
			cvUploads,
			jobSearchResults,
			allJobResults,
			applications,
			savedJobs,
			survey,
			stats,
		};
	},
});

// ===== USER ACTIVITY SUMMARY =====

// Get recent user activity summary
export const getUserActivitySummary = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const limit = args.limit || 10;

		// Get recent activities across different types
		const [recentCVs, recentSearches, recentApplications, recentSaved] =
			await Promise.all([
				ctx.db
					.query("cvUploads")
					.withIndex("by_user", (q) => q.eq("userId", userId))
					.order("desc")
					.take(limit),
				ctx.db
					.query("jobSearchResults")
					.withIndex("by_user", (q) => q.eq("userId", userId))
					.order("desc")
					.take(limit),
				ctx.db
					.query("userApplications")
					.withIndex("by_user", (q) => q.eq("userId", userId))
					.order("desc")
					.take(limit),
				ctx.db
					.query("savedJobs")
					.withIndex("by_user", (q) => q.eq("userId", userId))
					.order("desc")
					.take(limit),
			]);

		// Combine and sort by timestamp
		const activities = [
			...recentCVs.map((cv) => ({
				type: "cv_upload" as const,
				timestamp: cv.uploadedAt,
				data: cv,
			})),
			...recentSearches.map((search) => ({
				type: "job_search" as const,
				timestamp: search.createdAt,
				data: search,
			})),
			...recentApplications.map((app) => ({
				type: "application" as const,
				timestamp: app.appliedAt,
				data: app,
			})),
			...recentSaved.map((saved) => ({
				type: "saved_job" as const,
				timestamp: saved.savedAt,
				data: saved,
			})),
		]
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);

		return activities;
	},
});
