import { v } from "convex/values";
import { mutation } from "./_generated/server";
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
      // Ensure user is authenticated
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }
      
      return await ctx.storage.generateUploadUrl();
    },
  });
  

export const saveCV = mutation({
  args: { 
    storageId: v.id("_storage"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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

    return args.storageId;
  },
});
