import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Ensure user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveCV = mutation({
  args: { 
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to upload CV");
    }

    try {
      // Get file metadata from storage
      const metadata = await ctx.db.system.get(args.storageId);
      if (!metadata) {
        throw new Error("Uploaded file not found");
      }

      // Validate file type
      if (metadata.contentType !== "application/pdf") {
        throw new Error("Only PDF files are supported");
      }

      // Validate file size (5MB limit)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (metadata.size > maxSizeBytes) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Deactivate previous CVs for this user
      const previousCVs = await ctx.db
        .query("cvUploads")
        .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
        .collect();

      for (const cv of previousCVs) {
        await ctx.db.patch(cv._id, { isActive: false });
      }

      // Create new CV record
      const cvId = await ctx.db.insert("cvUploads", {
        userId,
        storageId: args.storageId,
        originalFileName: metadata.sha256 || "resume.pdf",
        fileSize: metadata.size,
        contentType: metadata.contentType,
        uploadedAt: Date.now(),
        lastAccessedAt: Date.now(),
        isActive: true,
      });

      return {
        cvId,
        storageId: args.storageId,
      };

    } catch (error) {
      console.error("Error saving CV:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to save CV");
    }
  },
});

// Query to get user's active CVs
export const getUserCVs = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("cvUploads")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Query to get a specific CV by ID (with user security check)
export const getCVById = query({
  args: { cvId: v.id("cvUploads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cv = await ctx.db.get(args.cvId);
    if (!cv || cv.userId !== userId) {
      throw new Error("CV not found or access denied");
    }

    return cv;
  },
});

// Mutation to delete a CV (hard delete - removes file from storage)
export const deleteCV = mutation({
  args: { cvId: v.id("cvUploads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cv = await ctx.db.get(args.cvId);
    if (!cv || cv.userId !== userId) {
      throw new Error("CV not found or access denied");
    }

    try {
      // Delete the actual file from storage
      await ctx.storage.delete(cv.storageId);
      
      // Remove the database record
      await ctx.db.delete(args.cvId);

      return true;
    } catch (error) {
      console.error("Error deleting CV:", error);
      throw new Error("Failed to delete CV");
    }
  },
});

// Mutation to get CV download URL (with access tracking)
export const getCVDownloadUrl = mutation({
  args: { cvId: v.id("cvUploads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cv = await ctx.db.get(args.cvId);
    if (!cv || cv.userId !== userId || !cv.isActive) {
      throw new Error("CV not found or access denied");
    }

    // Update last accessed time
    await ctx.db.patch(args.cvId, {
      lastAccessedAt: Date.now(),
    });

    // Return storage URL
    return await ctx.storage.getUrl(cv.storageId);
  },
});
