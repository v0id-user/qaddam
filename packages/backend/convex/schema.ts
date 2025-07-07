import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // Auth tables (includes users table)
  ...authTables,
  
  // User survey responses
  userSurveys: defineTable({
    // Foreign key to users table (managed by auth)
    userId: v.id("users"),
    
    // Survey responses
    profession: v.string(),
    experience: v.string(), // "0-1", "2-4", "5-8", "9+"
    careerLevel: v.string(), // "Entry", "Mid", "Senior", "Lead", "Manager"
    jobTitles: v.array(v.string()),
    industries: v.array(v.string()),
    workType: v.string(), // "Remote", "Hybrid", "On-site"
    locations: v.array(v.string()),
    skills: v.array(v.string()),
    languages: v.array(v.object({
      language: v.string(),
      proficiency: v.string(), // "Basic", "Intermediate", "Fluent"
    })),
    companyTypes: v.array(v.string()), // "Startup", "SME", "Enterprise", "Any"
    
    // Metadata
    completedAt: v.number(),
    version: v.optional(v.number()), // For future schema migrations
  })
    .index("by_user", ["userId"]) // Index for quick user lookup
    .index("by_completion_date", ["completedAt"]) // Index for analytics
    .index("by_profession", ["profession"]) // Index for profession-based queries
    .index("by_experience", ["experience"]) // Index for experience-based queries
    .index("by_work_type", ["workType"]), // Index for work type filtering

  // Job posts (for future job matching)
  jobPosts: defineTable({
    title: v.string(),
    company: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    skills: v.array(v.string()),
    location: v.string(),
    workType: v.string(), // "Remote", "Hybrid", "On-site"
    experienceLevel: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    isActive: v.boolean(),
    postedAt: v.number(),
    expiresAt: v.optional(v.number()),
    source: v.string(), // "LinkedIn", "Indeed", "Direct", etc.
    externalId: v.optional(v.string()), // External job posting ID
    
    // Analytics
    viewCount: v.optional(v.number()),
    applicationCount: v.optional(v.number()),
  })
    .index("by_active", ["isActive"])
    .index("by_posted_date", ["postedAt"])
    .index("by_work_type", ["workType"])
    .index("by_company", ["company"])
    .index("by_location", ["location"])
    .index("by_experience", ["experienceLevel"]),

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
});
