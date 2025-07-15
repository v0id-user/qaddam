/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as driver_apify_actors_driver from "../driver/apify/actors/driver.js";
import type * as driver_apify_actors_index from "../driver/apify/actors/index.js";
import type * as driver_apify_driver from "../driver/apify/driver.js";
import type * as driver_apify_index from "../driver/apify/index.js";
import type * as driver_jobs_actors_google_jobs from "../driver/jobs/actors/google_jobs.js";
import type * as driver_jobs_actors_index from "../driver/jobs/actors/index.js";
import type * as driver_jobs_actors_linkedin_jobs from "../driver/jobs/actors/linkedin_jobs.js";
import type * as driver_jobs_driver from "../driver/jobs/driver.js";
import type * as driver_jobs_index from "../driver/jobs/index.js";
import type * as driver_jobs_types_index from "../driver/jobs/types/index.js";
import type * as driver_jobs_types_job_source from "../driver/jobs/types/job_source.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as job_data from "../job_data.js";
import type * as jobs_actions_combineResults from "../jobs/actions/combineResults.js";
import type * as jobs_actions_parse from "../jobs/actions/parse.js";
import type * as jobs_actions_saveResults from "../jobs/actions/saveResults.js";
import type * as jobs_actions_searchJobs from "../jobs/actions/searchJobs.js";
import type * as jobs_actions_tuneSearch from "../jobs/actions/tuneSearch.js";
import type * as jobs_workflow from "../jobs/workflow.js";
import type * as listings_action from "../listings/action.js";
import type * as listings_mutation from "../listings/mutation.js";
import type * as ratelimiter from "../ratelimiter.js";
import type * as schemas_auth from "../schemas/auth.js";
import type * as schemas_index from "../schemas/index.js";
import type * as schemas_jobs from "../schemas/jobs.js";
import type * as schemas_surveys from "../schemas/surveys.js";
import type * as schemas_uploads from "../schemas/uploads.js";
import type * as schemas_workflowStage from "../schemas/workflowStage.js";
import type * as scripts_saveJobs from "../scripts/saveJobs.js";
import type * as surveys from "../surveys.js";
import type * as types_jobs from "../types/jobs.js";
import type * as types_workflow from "../types/workflow.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as workflow_status from "../workflow_status.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  "driver/jobs/actors/index": typeof driver_jobs_actors_index;
  "driver/jobs/actors/linkedin_jobs": typeof driver_jobs_actors_linkedin_jobs;
  "driver/jobs/driver": typeof driver_jobs_driver;
  "driver/jobs/index": typeof driver_jobs_index;
  "driver/jobs/types/index": typeof driver_jobs_types_index;
  "driver/jobs/types/job_source": typeof driver_jobs_types_job_source;
  healthCheck: typeof healthCheck;
  http: typeof http;
  job_data: typeof job_data;
  "jobs/actions/combineResults": typeof jobs_actions_combineResults;
  "jobs/actions/parse": typeof jobs_actions_parse;
  "jobs/actions/saveResults": typeof jobs_actions_saveResults;
  "jobs/actions/searchJobs": typeof jobs_actions_searchJobs;
  "jobs/actions/tuneSearch": typeof jobs_actions_tuneSearch;
  "jobs/workflow": typeof jobs_workflow;
  "listings/action": typeof listings_action;
  "listings/mutation": typeof listings_mutation;
  ratelimiter: typeof ratelimiter;
  "schemas/auth": typeof schemas_auth;
  "schemas/index": typeof schemas_index;
  "schemas/jobs": typeof schemas_jobs;
  "schemas/surveys": typeof schemas_surveys;
  "schemas/uploads": typeof schemas_uploads;
  "schemas/workflowStage": typeof schemas_workflowStage;
  "scripts/saveJobs": typeof scripts_saveJobs;
  surveys: typeof surveys;
  "types/jobs": typeof types_jobs;
  "types/workflow": typeof types_workflow;
  upload: typeof upload;
  users: typeof users;
  workflow_status: typeof workflow_status;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: {
    journal: {
      load: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          journalEntries: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          ok: boolean;
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      startStep: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          name: string;
          retry?:
            | boolean
            | { base: number; initialBackoffMs: number; maxAttempts: number };
          schedulerOptions?: { runAt?: number } | { runAfter?: number };
          step: {
            args: any;
            argsSize: number;
            completedAt?: number;
            functionType: "query" | "mutation" | "action";
            handle: string;
            inProgress: boolean;
            name: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            workId?: string;
          };
          workflowId: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        {
          _creationTime: number;
          _id: string;
          step: {
            args: any;
            argsSize: number;
            completedAt?: number;
            functionType: "query" | "mutation" | "action";
            handle: string;
            inProgress: boolean;
            name: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            workId?: string;
          };
          stepNumber: number;
          workflowId: string;
        }
      >;
    };
    workflow: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        null
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        boolean
      >;
      complete: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          now: number;
          runResult:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId: string;
        },
        null
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          maxParallelism?: number;
          onComplete?: { context?: any; fnHandle: string };
          validateAsync?: boolean;
          workflowArgs: any;
          workflowHandle: string;
          workflowName: string;
        },
        string
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
    };
  };
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
