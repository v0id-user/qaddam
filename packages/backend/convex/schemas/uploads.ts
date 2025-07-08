import { defineTable } from "convex/server";
import { v } from "convex/values";

export const uploadSchemas = {
  cvUploads: defineTable({
    // User association
    userId: v.id("users"),
    
    // File identification
    fileHash: v.string(), // SHA256 hash of the file content
    storageId: v.id("_storage"), // Convex storage ID
    
    // File metadata
    originalFileName: v.string(),
    fileSize: v.number(), // in bytes
    contentType: v.string(), // should be "application/pdf"
    
    // Timestamps
    uploadedAt: v.number(), // timestamp
    lastAccessedAt: v.optional(v.number()), // for analytics/cleanup
    
    // Status
    isActive: v.boolean(), // for soft deletion
  })
    // Index by user for scoping and security
    .index("by_user", ["userId"])
    // Index by user and hash for quick lookups and preventing duplicates
    .index("by_user_hash", ["userId", "fileHash"])
    // Index by hash for global deduplication (optional)
    .index("by_hash", ["fileHash"])
    // Index by user and active status for listing user's active CVs
    .index("by_user_active", ["userId", "isActive"]),
}; 