import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import crypto from "crypto";

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
    // Ensure user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get file metadata to validate file type and size
    const metadata = await ctx.db.system.get(args.storageId);
    if (!metadata) {
      throw new Error("File metadata not found");
    }

    if (metadata.contentType !== "application/pdf") {
      throw new Error("Only PDF files are allowed");
    }

    if (metadata.size > 5 * 1024 * 1024) { // 5MB in bytes
      throw new Error("File size must be less than 5MB");
    }

    // Generate SHA256 hash using storage ID and metadata (deterministic approach)
    // This creates a unique hash based on file content identifier and metadata
    const hashData = `${args.storageId}-${metadata.size}-${metadata.contentType}`;
    const hashSum = crypto.createHash('sha256');
    hashSum.update(hashData);
    const fileHash = hashSum.digest('hex');

    // Check if this exact file already exists for this user
    const existingCV = await ctx.db
      .query("cvUploads")
      .withIndex("by_user_hash", (q) => q.eq("userId", userId).eq("fileHash", fileHash))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingCV) {
      // File already exists, update last accessed time and return existing entry
      await ctx.db.patch(existingCV._id, {
        lastAccessedAt: Date.now(),
      });
      
      return {
        cvId: existingCV._id,
        fileHash,
        isDuplicate: true,
        storageId: existingCV.storageId,
      };
    }

    // Deactivate any previous active CVs for this user (optional - allows only one active CV)
    const previousCVs = await ctx.db
      .query("cvUploads")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    for (const cv of previousCVs) {
      await ctx.db.patch(cv._id, { isActive: false });
    }

    // Create new CV entry
    const cvId = await ctx.db.insert("cvUploads", {
      userId,
      fileHash,
      storageId: args.storageId,
      originalFileName: metadata.sha256 || "resume.pdf", // Use sha256 as filename fallback
      fileSize: metadata.size,
      contentType: metadata.contentType,
      uploadedAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    return {
      cvId,
      fileHash,
      isDuplicate: false,
      storageId: args.storageId,
    };
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

// Mutation to delete a CV (soft delete)
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

    // Soft delete
    await ctx.db.patch(args.cvId, {
      isActive: false,
      lastAccessedAt: Date.now(),
    });

    return true;
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
