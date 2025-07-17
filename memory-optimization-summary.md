# Memory Optimization Summary for Convex Deployment

## Issue
The backend was failing to deploy due to JavaScript execution running out of memory, hitting the 64MB limit. This was caused by large Zod schemas and inlined complex types.

## Solutions Implemented

### 1. Created Dedicated Schema Files in `/schemas/zod/`

- **`linkedin.ts`** - Minimal LinkedIn job schema with only fields used in normalization
- **`indeed.ts`** - Minimal Indeed job schema with only fields used in normalization  
- **`crawled-jobs.ts`** - Discriminated union schema for crawled jobs (more memory efficient)
- **`cv-profile.ts`** - CV profile schema for parsing user CVs
- **`keyword-extraction.ts`** - Keyword extraction schema for job search optimization
- **`job-ranking.ts`** - Job ranking and insights schema
- **`batch-job-analysis.ts`** - Batch job analysis schema for comprehensive job processing

### 2. Replaced Large Inline Schemas

#### Before (Memory-Intensive):
```typescript
// Large inline schemas in mutation files
const batchJobAnalysisSchema = z.object({
  jobAnalyses: z.array(
    z.object({
      // ... 70+ lines of nested schema definitions
    })
  )
});
```

#### After (Memory-Efficient):
```typescript
// External import of pre-defined schema
import { BatchJobAnalysisSchema } from "../../schemas/zod/batch-job-analysis";
```

### 3. Used Discriminated Union Instead of Regular Union

#### Before:
```typescript
const CrawledJobsSchema = z.union([
  z.object({ source: z.literal("linkedIn"), jobs: z.array(LinkedInJobSchema) }),
  z.object({ source: z.literal("indeed"), jobs: z.array(IndeedJobSchema) }),
]);
```

#### After:
```typescript
const CrawledJobsSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("linkedIn"), jobs: z.array(MinimalLinkedInJobSchema) }),
  z.object({ source: z.literal("indeed"), jobs: z.array(MinimalIndeedJobSchema) }),
]);
```

### 4. Removed `.catchall(z.any())` from Schemas

The old schemas used `.catchall(z.any())` which is memory-intensive. The new minimal schemas only include the fields actually used in the normalization process.

### 5. Created Pre-defined Parsers for Better Performance

```typescript
// Pre-defined parser for better performance
export const CrawledJobsArrayParser = z.array(CrawledJobsSchema);
```

### 6. Optimized Type Imports

Replaced imports of full job interfaces with minimal types:
- `LinkedInJob` → `MinimalLinkedInJob`
- `IndeedJob` → `MinimalIndeedJob`

## Files Modified

### Core Schema Files
- ✅ `packages/backend/convex/schemas/zod/linkedin.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/indeed.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/crawled-jobs.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/cv-profile.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/keyword-extraction.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/job-ranking.ts` (NEW)
- ✅ `packages/backend/convex/schemas/zod/batch-job-analysis.ts` (NEW)

### Updated Files
- ✅ `packages/backend/convex/listings/mutation.ts` - Uses new discriminated union and minimal schemas
- ✅ `packages/backend/convex/listings/action.ts` - Updated type imports
- ✅ `packages/backend/convex/driver/norm.ts` - Updated to work with minimal schemas
- ✅ `packages/backend/convex/driver/jobs/schemas.ts` - Re-exports minimal schemas for compatibility
- ✅ `packages/backend/convex/jobs/actions/parse.ts` - External CV profile schema
- ✅ `packages/backend/convex/jobs/actions/tuneSearch.ts` - External keyword extraction schema
- ✅ `packages/backend/convex/jobs/actions/searchJobs.ts` - External batch job analysis schema
- ✅ `packages/backend/convex/jobs/actions/combineResults.ts` - External job ranking schema

## Memory Impact

### Before:
- Large inline schemas loaded into memory for each function
- `.catchall(z.any())` caused memory bloat
- Regular union types required more processing
- Full job interfaces with unused fields

### After:
- Minimal schemas with only required fields
- External schema files reduce duplication
- Discriminated unions for better performance
- Pre-defined parsers for efficiency

## Key Benefits

1. **Reduced Memory Usage**: Minimal schemas with only required fields
2. **Better Performance**: Discriminated unions and pre-defined parsers
3. **Cleaner Code**: External schema files reduce duplication
4. **Type Safety**: Maintained full TypeScript type safety
5. **Maintainability**: Centralized schema definitions

## Testing Recommendations

1. Test CV parsing with the new `CVProfileSchema`
2. Verify job search with updated `KeywordExtractionSchema`
3. Test job ranking with new `JobRankingSchema`
4. Ensure batch job analysis works with `BatchJobAnalysisSchema`
5. Verify job listing insertion with minimal schemas

The refactoring maintains full functionality while significantly reducing memory usage to resolve the Convex deployment issue.