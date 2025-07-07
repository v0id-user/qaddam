import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  
  userSurveys: defineTable({
    userId: v.id("users"),
    
    // Survey responses
    profession: v.string(),
    experience: v.string(), // "0-1", "2-4", "5-8", "9+"
    careerLevel: v.string(), // "Student", "Entry", "Mid", "Senior", "Lead", "Manager"
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
  }).index("by_user", ["userId"]),
});
