# Job Normalization Implementation

## Overview

I've implemented a comprehensive job normalization system for handling job results from multiple actor sources (LinkedIn and Indeed) and storing them in the unified `jobListings` table. The implementation follows all the specified requirements and uses `snake_case` naming convention as required for Convex.

## Files Created

### 1. `packages/backend/convex/normalize_job.ts`

This is the main implementation file containing:

- **Core normalization function**: `normalize_job(raw: unknown, source: string): JobListing | null`
- **Helper functions**: `normalize_linkedin_job()` and `normalize_indeed_job()`
- **Main mutation**: `add_new_jobs_listing()` for processing job search results
- **Utility functions**: `parse_salary()` for best-effort salary parsing

### 2. `packages/backend/convex/tests/normalize_job.test.ts`

Comprehensive test suite covering:
- LinkedIn job normalization
- Indeed job normalization
- Salary parsing edge cases
- Error handling for missing fields
- Different currency formats

## Key Features

### ✅ Requirements Met

1. **Snake_case naming**: All functions use `snake_case` as required by Convex
2. **No runtime validation libraries**: Uses explicit casting based on source field
3. **Wrapper object handling**: Supports unwrapping `{ linkedInJobs: [...] }` and `{ indeedJobs: [...] }`
4. **Source field support**: Handles `"linked-in"` and `"indeed"` source values
5. **Returns inserted IDs**: Returns array of inserted job listing IDs
6. **Robust error handling**: Gracefully handles missing or invalid data

### 🔧 Core Functionality

#### Source Detection & Unwrapping
The mutation handles multiple input formats:
- Arrays of job results
- Single job result objects
- Wrapper objects like `{ linkedInJobs: [...] }` or `{ indeedJobs: [...] }`
- Objects with explicit `source` field
- Automatic source inference from object structure

#### Field Mapping

**LinkedIn Jobs:**
- `id` → `sourceId`
- `title` → `name`
- `link` → `sourceUrl`
- `descriptionHtml` → `descriptionHtml`
- `descriptionText` → `description`
- `companyName` → `sourceName`
- `location` → `location` and `sourceLocation`
- `salaryInfo` → parsed to `salary` and `currency`
- `postedAt` → parsed to `datePosted`

**Indeed Jobs:**
- `positionName` → `name`
- `url` → `sourceUrl` (also used to generate `sourceId`)
- `company` → `sourceName`
- `location` → `location` and `sourceLocation`
- `salary` → parsed to `salary` and `currency`
- `jobType` → joined to `description`
- `companyInfo.companyLogo` → `sourceLogo`
- `companyInfo.companyDescription` → `sourceDescription`

#### Salary Parsing
Robust salary parsing that handles:
- Salary ranges: `"$100,000 - $150,000"` → average (125000)
- Single amounts: `"$95,000"` → exact value (95000)
- Multiple currencies: `$`, `£`, `€`, `USD`, `GBP`, `EUR`
- Comma-separated numbers: `"100,000"` → 100000

#### Error Handling
- Returns `null` for jobs missing essential fields (title, link for LinkedIn; positionName, url for Indeed)
- Logs detailed error information for debugging
- Tracks and reports skipped jobs
- Continues processing even if individual jobs fail

### 📊 Database Schema Compliance

The implementation perfectly matches the `jobListings` table schema:

```typescript
jobListings: defineTable({
  name: v.string(),                    // ✅ Job title
  descriptionHtml: v.string(),         // ✅ HTML description
  description: v.string(),             // ✅ Plain text description
  location: v.optional(v.string()),    // ✅ Job location
  salary: v.optional(v.number()),      // ✅ Parsed salary amount
  currency: v.optional(v.string()),    // ✅ Currency code
  source: v.optional(v.string()),      // ✅ "LinkedIn" or "Indeed"
  sourceId: v.optional(v.string()),    // ✅ Original job ID
  datePosted: v.optional(v.number()),  // ✅ Timestamp (LinkedIn only)
  sourceUrl: v.optional(v.string()),   // ✅ Original job URL
  sourceName: v.optional(v.string()),  // ✅ Company name
  sourceLogo: v.optional(v.string()),  // ✅ Company logo (Indeed only)
  sourceDescription: v.optional(v.string()), // ✅ Company description
  sourceLocation: v.optional(v.string()),    // ✅ Company location
})
```

### 🚀 Usage Example

```typescript
// Import the mutation
import { api } from "./_generated/api";

// Example job search results
const jobSearchResults = [
  {
    linkedInJobs: [
      {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        companyName: "Tech Corp",
        descriptionHtml: "<p>Great opportunity</p>",
        descriptionText: "Great opportunity",
        location: "San Francisco, CA",
        salaryInfo: ["$100,000 - $150,000"],
        postedAt: "2024-01-15T10:00:00Z",
      }
    ]
  },
  {
    indeedJobs: [
      {
        positionName: "Frontend Developer",
        url: "https://indeed.com/jobs/987654",
        company: "Web Solutions Inc",
        salary: "$80,000 - $120,000",
        jobType: ["Full-time", "Remote"],
        location: "New York, NY",
        companyInfo: {
          companyLogo: "https://logo.com/company.png",
          companyDescription: "Leading web development company",
        },
      }
    ]
  }
];

// Call the mutation
const insertedIds = await ctx.runMutation(api.normalize_job.add_new_jobs_listing, {
  jobSearchResults
});

// Returns: ["job_id_1", "job_id_2", ...]
```

### 🔍 Logging & Monitoring

The implementation includes comprehensive logging:
- Process start/completion statistics
- Individual job processing errors
- Source detection and inference
- Skipped job counts
- Performance metrics

### 🧪 Testing

The test suite covers:
- Valid job normalization for both sources
- Missing required fields handling
- Salary parsing edge cases
- Different currency formats
- Unknown source handling
- Error scenarios

## Integration

The implementation is ready to use immediately:

1. **File location**: `packages/backend/convex/normalize_job.ts`
2. **Function name**: `add_new_jobs_listing` (follows snake_case convention)
3. **Import path**: `api.normalize_job.add_new_jobs_listing`
4. **Return type**: `Promise<string[]>` (array of inserted job IDs)

This implementation provides a robust, scalable solution for normalizing job data from multiple sources while maintaining data integrity and providing excellent error handling and monitoring capabilities.