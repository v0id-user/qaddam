import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Save a job for the current user
 */
export const saveJob = mutation({
  args: {
    jobListingId: v.id("jobListings"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if job is already saved
    const existingSavedJob = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", userId).eq("jobPostId", args.jobListingId)
      )
      .unique();

    if (existingSavedJob) {
      throw new Error("Job already saved");
    }

    // Verify the job listing exists
    const jobListing = await ctx.db.get(args.jobListingId);
    if (!jobListing) {
      throw new Error("Job listing not found");
    }

    const savedJobId = await ctx.db.insert("savedJobs", {
      userId: userId,
      jobPostId: args.jobListingId,
      savedAt: Date.now(),
      notes: args.notes,
    });

    return savedJobId;
  },
});

/**
 * Unsave a job for the current user
 */
export const unsaveJob = mutation({
  args: {
    jobListingId: v.id("jobListings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the saved job
    const savedJob = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", userId).eq("jobPostId", args.jobListingId)
      )
      .unique();

    if (!savedJob) {
      throw new Error("Job not saved");
    }

    await ctx.db.delete(savedJob._id);
    return { success: true };
  },
});

/**
 * Check if a job is saved by the current user
 */
export const isJobSaved = query({
  args: {
    jobListingId: v.id("jobListings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const savedJob = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", userId).eq("jobPostId", args.jobListingId)
      )
      .unique();

    return !!savedJob;
  },
});

/**
 * Get all saved jobs for the current user
 */
export const getSavedJobs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    // Get saved jobs ordered by most recently saved
    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + offset);

    const paginatedSavedJobs = savedJobs.slice(offset, offset + limit);

    // Get the actual job listings
    const jobListings = await Promise.all(
      paginatedSavedJobs.map(async (savedJob) => {
        const jobListing = await ctx.db.get(savedJob.jobPostId);
        return {
          savedJob,
          jobListing,
        };
      })
    );

    // Filter out any jobs that no longer exist
    const validJobListings = jobListings.filter(
      (item) => item.jobListing !== null
    );

    return {
      savedJobs: validJobListings.map((item) => ({
        ...item.savedJob,
        jobListing: item.jobListing!,
      })),
      totalCount: savedJobs.length,
      hasMore: savedJobs.length > offset + limit,
    };
  },
});

/**
 * Get count of saved jobs for the current user
 */
export const getSavedJobsCount = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return savedJobs.length;
  },
});