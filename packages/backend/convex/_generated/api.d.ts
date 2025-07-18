/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as driver_apify_actors_driver from "../driver/apify/actors/driver.js";
import type * as driver_apify_actors_index from "../driver/apify/actors/index.js";
import type * as driver_apify_driver from "../driver/apify/driver.js";
import type * as driver_apify_index from "../driver/apify/index.js";
import type * as driver_jobs_actors_google_jobs from "../driver/jobs/actors/google_jobs.js";
import type * as driver_jobs_actors_indeed_jobs from "../driver/jobs/actors/indeed_jobs.js";
import type * as driver_jobs_actors_index from "../driver/jobs/actors/index.js";
import type * as driver_jobs_actors_linkedin_jobs from "../driver/jobs/actors/linkedin_jobs.js";
import type * as driver_jobs_driver from "../driver/jobs/driver.js";
import type * as driver_jobs_index from "../driver/jobs/index.js";
import type * as driver_jobs_schemas from "../driver/jobs/schemas.js";
import type * as driver_jobs_types_index from "../driver/jobs/types/index.js";
import type * as driver_jobs_types_job_source from "../driver/jobs/types/job_source.js";
import type * as driver_norm from "../driver/norm.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as job_data from "../job_data.js";
import type * as jobs_actions_combineResults from "../jobs/actions/combineResults.js";
import type * as jobs_actions_parse from "../jobs/actions/parse.js";
import type * as jobs_actions_saveResults from "../jobs/actions/saveResults.js";
import type * as jobs_actions_searchJobs from "../jobs/actions/searchJobs.js";
import type * as jobs_actions_tuneSearch from "../jobs/actions/tuneSearch.js";
import type * as jobs_workflow from "../jobs/workflow.js";
import type * as lib_ai_schemas from "../lib/ai_schemas.js";
import type * as lib_validators from "../lib/validators.js";
import type * as listings_action from "../listings/action.js";
import type * as listings_mutation from "../listings/mutation.js";
import type * as normalize_job from "../normalize_job.js";
import type * as polar from "../polar.js";
import type * as ratelimiter from "../ratelimiter.js";
import type * as schemas_auth from "../schemas/auth.js";
import type * as schemas_index from "../schemas/index.js";
import type * as schemas_jobs from "../schemas/jobs.js";
import type * as schemas_surveys from "../schemas/surveys.js";
import type * as schemas_uploads from "../schemas/uploads.js";
import type * as schemas_workflowStage from "../schemas/workflowStage.js";
import type * as scripts_saveJobs from "../scripts/saveJobs.js";
import type * as surveys from "../surveys.js";
import type * as types_job_types from "../types/job_types.js";
import type * as types_jobs from "../types/jobs.js";
import type * as types_workflow from "../types/workflow.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as workflow_status from "../workflow_status.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  "driver/apify/actors/driver": typeof driver_apify_actors_driver;
  "driver/apify/actors/index": typeof driver_apify_actors_index;
  "driver/apify/driver": typeof driver_apify_driver;
  "driver/apify/index": typeof driver_apify_index;
  "driver/jobs/actors/google_jobs": typeof driver_jobs_actors_google_jobs;
  "driver/jobs/actors/indeed_jobs": typeof driver_jobs_actors_indeed_jobs;
  "driver/jobs/actors/index": typeof driver_jobs_actors_index;
  "driver/jobs/actors/linkedin_jobs": typeof driver_jobs_actors_linkedin_jobs;
  "driver/jobs/driver": typeof driver_jobs_driver;
  "driver/jobs/index": typeof driver_jobs_index;
  "driver/jobs/schemas": typeof driver_jobs_schemas;
  "driver/jobs/types/index": typeof driver_jobs_types_index;
  "driver/jobs/types/job_source": typeof driver_jobs_types_job_source;
  "driver/norm": typeof driver_norm;
  healthCheck: typeof healthCheck;
  http: typeof http;
  job_data: typeof job_data;
  "jobs/actions/combineResults": typeof jobs_actions_combineResults;
  "jobs/actions/parse": typeof jobs_actions_parse;
  "jobs/actions/saveResults": typeof jobs_actions_saveResults;
  "jobs/actions/searchJobs": typeof jobs_actions_searchJobs;
  "jobs/actions/tuneSearch": typeof jobs_actions_tuneSearch;
  "jobs/workflow": typeof jobs_workflow;
  "lib/ai_schemas": typeof lib_ai_schemas;
  "lib/validators": typeof lib_validators;
  "listings/action": typeof listings_action;
  "listings/mutation": typeof listings_mutation;
  normalize_job: typeof normalize_job;
  polar: typeof polar;
  ratelimiter: typeof ratelimiter;
  "schemas/auth": typeof schemas_auth;
  "schemas/index": typeof schemas_index;
  "schemas/jobs": typeof schemas_jobs;
  "schemas/surveys": typeof schemas_surveys;
  "schemas/uploads": typeof schemas_uploads;
  "schemas/workflowStage": typeof schemas_workflowStage;
  "scripts/saveJobs": typeof scripts_saveJobs;
  surveys: typeof surveys;
  "types/job_types": typeof types_job_types;
  "types/jobs": typeof types_jobs;
  "types/workflow": typeof types_workflow;
  upload: typeof upload;
  users: typeof users;
  workflow_status: typeof workflow_status;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
