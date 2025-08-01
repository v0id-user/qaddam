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
import type * as jobs_results from "../jobs/results.js";
import type * as jobs_workflow from "../jobs/workflow.js";
import type * as lib_schemas_batch_job_analysis from "../lib/schemas/batch_job_analysis.js";
import type * as lib_schemas_cv_profile from "../lib/schemas/cv_profile.js";
import type * as lib_schemas_job_ranking from "../lib/schemas/job_ranking.js";
import type * as lib_schemas_keyword_extraction from "../lib/schemas/keyword_extraction.js";
import type * as lib_validators from "../lib/validators.js";
import type * as listings_action from "../listings/action.js";
import type * as listings_mutation from "../listings/mutation.js";
import type * as listings_query from "../listings/query.js";
import type * as polar from "../polar.js";
import type * as profile from "../profile.js";
import type * as ratelimiter from "../ratelimiter.js";
import type * as schemas_auth from "../schemas/auth.js";
import type * as schemas_jobs from "../schemas/jobs.js";
import type * as schemas_surveys from "../schemas/surveys.js";
import type * as schemas_uploads from "../schemas/uploads.js";
import type * as schemas_usage from "../schemas/usage.js";
import type * as schemas_user_config from "../schemas/user_config.js";
import type * as schemas_workflowStage from "../schemas/workflowStage.js";
import type * as scripts_saveJobs from "../scripts/saveJobs.js";
import type * as surveys from "../surveys.js";
import type * as types_job_types from "../types/job_types.js";
import type * as types_jobs from "../types/jobs.js";
import type * as types_workflow from "../types/workflow.js";
import type * as upload from "../upload.js";
import type * as user_data from "../user_data.js";
import type * as user_usage from "../user_usage.js";
import type * as users from "../users.js";
import type * as usersConfig from "../usersConfig.js";
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
	"jobs/results": typeof jobs_results;
	"jobs/workflow": typeof jobs_workflow;
	"lib/schemas/batch_job_analysis": typeof lib_schemas_batch_job_analysis;
	"lib/schemas/cv_profile": typeof lib_schemas_cv_profile;
	"lib/schemas/job_ranking": typeof lib_schemas_job_ranking;
	"lib/schemas/keyword_extraction": typeof lib_schemas_keyword_extraction;
	"lib/validators": typeof lib_validators;
	"listings/action": typeof listings_action;
	"listings/mutation": typeof listings_mutation;
	"listings/query": typeof listings_query;
	polar: typeof polar;
	profile: typeof profile;
	ratelimiter: typeof ratelimiter;
	"schemas/auth": typeof schemas_auth;
	"schemas/jobs": typeof schemas_jobs;
	"schemas/surveys": typeof schemas_surveys;
	"schemas/uploads": typeof schemas_uploads;
	"schemas/usage": typeof schemas_usage;
	"schemas/user_config": typeof schemas_user_config;
	"schemas/workflowStage": typeof schemas_workflowStage;
	"scripts/saveJobs": typeof scripts_saveJobs;
	surveys: typeof surveys;
	"types/job_types": typeof types_job_types;
	"types/jobs": typeof types_jobs;
	"types/workflow": typeof types_workflow;
	upload: typeof upload;
	user_data: typeof user_data;
	user_usage: typeof user_usage;
	users: typeof users;
	usersConfig: typeof usersConfig;
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
	polar: {
		lib: {
			createProduct: FunctionReference<
				"mutation",
				"internal",
				{
					product: {
						createdAt: string;
						description: string | null;
						id: string;
						isArchived: boolean;
						isRecurring: boolean;
						medias: Array<{
							checksumEtag: string | null;
							checksumSha256Base64: string | null;
							checksumSha256Hex: string | null;
							createdAt: string;
							id: string;
							isUploaded: boolean;
							lastModifiedAt: string | null;
							mimeType: string;
							name: string;
							organizationId: string;
							path: string;
							publicUrl: string;
							service?: string;
							size: number;
							sizeReadable: string;
							storageVersion: string | null;
							version: string | null;
						}>;
						metadata?: Record<string, any>;
						modifiedAt: string | null;
						name: string;
						organizationId: string;
						prices: Array<{
							amountType?: string;
							createdAt: string;
							id: string;
							isArchived: boolean;
							modifiedAt: string | null;
							priceAmount?: number;
							priceCurrency?: string;
							productId: string;
							recurringInterval?: "month" | "year" | null;
							type?: string;
						}>;
						recurringInterval?: "month" | "year" | null;
					};
				},
				any
			>;
			createSubscription: FunctionReference<
				"mutation",
				"internal",
				{
					subscription: {
						amount: number | null;
						cancelAtPeriodEnd: boolean;
						checkoutId: string | null;
						createdAt: string;
						currency: string | null;
						currentPeriodEnd: string | null;
						currentPeriodStart: string;
						customerCancellationComment?: string | null;
						customerCancellationReason?: string | null;
						customerId: string;
						endedAt: string | null;
						id: string;
						metadata: Record<string, any>;
						modifiedAt: string | null;
						priceId?: string;
						productId: string;
						recurringInterval: "month" | "year" | null;
						startedAt: string | null;
						status: string;
					};
				},
				any
			>;
			getCurrentSubscription: FunctionReference<
				"query",
				"internal",
				{ userId: string },
				{
					amount: number | null;
					cancelAtPeriodEnd: boolean;
					checkoutId: string | null;
					createdAt: string;
					currency: string | null;
					currentPeriodEnd: string | null;
					currentPeriodStart: string;
					customerCancellationComment?: string | null;
					customerCancellationReason?: string | null;
					customerId: string;
					endedAt: string | null;
					id: string;
					metadata: Record<string, any>;
					modifiedAt: string | null;
					priceId?: string;
					product: {
						createdAt: string;
						description: string | null;
						id: string;
						isArchived: boolean;
						isRecurring: boolean;
						medias: Array<{
							checksumEtag: string | null;
							checksumSha256Base64: string | null;
							checksumSha256Hex: string | null;
							createdAt: string;
							id: string;
							isUploaded: boolean;
							lastModifiedAt: string | null;
							mimeType: string;
							name: string;
							organizationId: string;
							path: string;
							publicUrl: string;
							service?: string;
							size: number;
							sizeReadable: string;
							storageVersion: string | null;
							version: string | null;
						}>;
						metadata?: Record<string, any>;
						modifiedAt: string | null;
						name: string;
						organizationId: string;
						prices: Array<{
							amountType?: string;
							createdAt: string;
							id: string;
							isArchived: boolean;
							modifiedAt: string | null;
							priceAmount?: number;
							priceCurrency?: string;
							productId: string;
							recurringInterval?: "month" | "year" | null;
							type?: string;
						}>;
						recurringInterval?: "month" | "year" | null;
					};
					productId: string;
					recurringInterval: "month" | "year" | null;
					startedAt: string | null;
					status: string;
				} | null
			>;
			getCustomerByUserId: FunctionReference<
				"query",
				"internal",
				{ userId: string },
				{ id: string; metadata?: Record<string, any>; userId: string } | null
			>;
			getProduct: FunctionReference<
				"query",
				"internal",
				{ id: string },
				{
					createdAt: string;
					description: string | null;
					id: string;
					isArchived: boolean;
					isRecurring: boolean;
					medias: Array<{
						checksumEtag: string | null;
						checksumSha256Base64: string | null;
						checksumSha256Hex: string | null;
						createdAt: string;
						id: string;
						isUploaded: boolean;
						lastModifiedAt: string | null;
						mimeType: string;
						name: string;
						organizationId: string;
						path: string;
						publicUrl: string;
						service?: string;
						size: number;
						sizeReadable: string;
						storageVersion: string | null;
						version: string | null;
					}>;
					metadata?: Record<string, any>;
					modifiedAt: string | null;
					name: string;
					organizationId: string;
					prices: Array<{
						amountType?: string;
						createdAt: string;
						id: string;
						isArchived: boolean;
						modifiedAt: string | null;
						priceAmount?: number;
						priceCurrency?: string;
						productId: string;
						recurringInterval?: "month" | "year" | null;
						type?: string;
					}>;
					recurringInterval?: "month" | "year" | null;
				} | null
			>;
			getSubscription: FunctionReference<
				"query",
				"internal",
				{ id: string },
				{
					amount: number | null;
					cancelAtPeriodEnd: boolean;
					checkoutId: string | null;
					createdAt: string;
					currency: string | null;
					currentPeriodEnd: string | null;
					currentPeriodStart: string;
					customerCancellationComment?: string | null;
					customerCancellationReason?: string | null;
					customerId: string;
					endedAt: string | null;
					id: string;
					metadata: Record<string, any>;
					modifiedAt: string | null;
					priceId?: string;
					productId: string;
					recurringInterval: "month" | "year" | null;
					startedAt: string | null;
					status: string;
				} | null
			>;
			insertCustomer: FunctionReference<
				"mutation",
				"internal",
				{ id: string; metadata?: Record<string, any>; userId: string },
				string
			>;
			listCustomerSubscriptions: FunctionReference<
				"query",
				"internal",
				{ customerId: string },
				Array<{
					amount: number | null;
					cancelAtPeriodEnd: boolean;
					checkoutId: string | null;
					createdAt: string;
					currency: string | null;
					currentPeriodEnd: string | null;
					currentPeriodStart: string;
					customerCancellationComment?: string | null;
					customerCancellationReason?: string | null;
					customerId: string;
					endedAt: string | null;
					id: string;
					metadata: Record<string, any>;
					modifiedAt: string | null;
					priceId?: string;
					productId: string;
					recurringInterval: "month" | "year" | null;
					startedAt: string | null;
					status: string;
				}>
			>;
			listProducts: FunctionReference<
				"query",
				"internal",
				{ includeArchived?: boolean },
				Array<{
					createdAt: string;
					description: string | null;
					id: string;
					isArchived: boolean;
					isRecurring: boolean;
					medias: Array<{
						checksumEtag: string | null;
						checksumSha256Base64: string | null;
						checksumSha256Hex: string | null;
						createdAt: string;
						id: string;
						isUploaded: boolean;
						lastModifiedAt: string | null;
						mimeType: string;
						name: string;
						organizationId: string;
						path: string;
						publicUrl: string;
						service?: string;
						size: number;
						sizeReadable: string;
						storageVersion: string | null;
						version: string | null;
					}>;
					metadata?: Record<string, any>;
					modifiedAt: string | null;
					name: string;
					organizationId: string;
					priceAmount?: number;
					prices: Array<{
						amountType?: string;
						createdAt: string;
						id: string;
						isArchived: boolean;
						modifiedAt: string | null;
						priceAmount?: number;
						priceCurrency?: string;
						productId: string;
						recurringInterval?: "month" | "year" | null;
						type?: string;
					}>;
					recurringInterval?: "month" | "year" | null;
				}>
			>;
			listUserSubscriptions: FunctionReference<
				"query",
				"internal",
				{ userId: string },
				Array<{
					amount: number | null;
					cancelAtPeriodEnd: boolean;
					checkoutId: string | null;
					createdAt: string;
					currency: string | null;
					currentPeriodEnd: string | null;
					currentPeriodStart: string;
					customerCancellationComment?: string | null;
					customerCancellationReason?: string | null;
					customerId: string;
					endedAt: string | null;
					id: string;
					metadata: Record<string, any>;
					modifiedAt: string | null;
					priceId?: string;
					product: {
						createdAt: string;
						description: string | null;
						id: string;
						isArchived: boolean;
						isRecurring: boolean;
						medias: Array<{
							checksumEtag: string | null;
							checksumSha256Base64: string | null;
							checksumSha256Hex: string | null;
							createdAt: string;
							id: string;
							isUploaded: boolean;
							lastModifiedAt: string | null;
							mimeType: string;
							name: string;
							organizationId: string;
							path: string;
							publicUrl: string;
							service?: string;
							size: number;
							sizeReadable: string;
							storageVersion: string | null;
							version: string | null;
						}>;
						metadata?: Record<string, any>;
						modifiedAt: string | null;
						name: string;
						organizationId: string;
						prices: Array<{
							amountType?: string;
							createdAt: string;
							id: string;
							isArchived: boolean;
							modifiedAt: string | null;
							priceAmount?: number;
							priceCurrency?: string;
							productId: string;
							recurringInterval?: "month" | "year" | null;
							type?: string;
						}>;
						recurringInterval?: "month" | "year" | null;
					} | null;
					productId: string;
					recurringInterval: "month" | "year" | null;
					startedAt: string | null;
					status: string;
				}>
			>;
			syncProducts: FunctionReference<
				"action",
				"internal",
				{ polarAccessToken: string; server: "sandbox" | "production" },
				any
			>;
			updateProduct: FunctionReference<
				"mutation",
				"internal",
				{
					product: {
						createdAt: string;
						description: string | null;
						id: string;
						isArchived: boolean;
						isRecurring: boolean;
						medias: Array<{
							checksumEtag: string | null;
							checksumSha256Base64: string | null;
							checksumSha256Hex: string | null;
							createdAt: string;
							id: string;
							isUploaded: boolean;
							lastModifiedAt: string | null;
							mimeType: string;
							name: string;
							organizationId: string;
							path: string;
							publicUrl: string;
							service?: string;
							size: number;
							sizeReadable: string;
							storageVersion: string | null;
							version: string | null;
						}>;
						metadata?: Record<string, any>;
						modifiedAt: string | null;
						name: string;
						organizationId: string;
						prices: Array<{
							amountType?: string;
							createdAt: string;
							id: string;
							isArchived: boolean;
							modifiedAt: string | null;
							priceAmount?: number;
							priceCurrency?: string;
							productId: string;
							recurringInterval?: "month" | "year" | null;
							type?: string;
						}>;
						recurringInterval?: "month" | "year" | null;
					};
				},
				any
			>;
			updateProducts: FunctionReference<
				"mutation",
				"internal",
				{
					polarAccessToken: string;
					products: Array<{
						createdAt: string;
						description: string | null;
						id: string;
						isArchived: boolean;
						isRecurring: boolean;
						medias: Array<{
							checksumEtag: string | null;
							checksumSha256Base64: string | null;
							checksumSha256Hex: string | null;
							createdAt: string;
							id: string;
							isUploaded: boolean;
							lastModifiedAt: string | null;
							mimeType: string;
							name: string;
							organizationId: string;
							path: string;
							publicUrl: string;
							service?: string;
							size: number;
							sizeReadable: string;
							storageVersion: string | null;
							version: string | null;
						}>;
						metadata?: Record<string, any>;
						modifiedAt: string | null;
						name: string;
						organizationId: string;
						prices: Array<{
							amountType?: string;
							createdAt: string;
							id: string;
							isArchived: boolean;
							modifiedAt: string | null;
							priceAmount?: number;
							priceCurrency?: string;
							productId: string;
							recurringInterval?: "month" | "year" | null;
							type?: string;
						}>;
						recurringInterval?: "month" | "year" | null;
					}>;
				},
				any
			>;
			updateSubscription: FunctionReference<
				"mutation",
				"internal",
				{
					subscription: {
						amount: number | null;
						cancelAtPeriodEnd: boolean;
						checkoutId: string | null;
						createdAt: string;
						currency: string | null;
						currentPeriodEnd: string | null;
						currentPeriodStart: string;
						customerCancellationComment?: string | null;
						customerCancellationReason?: string | null;
						customerId: string;
						endedAt: string | null;
						id: string;
						metadata: Record<string, any>;
						modifiedAt: string | null;
						priceId?: string;
						productId: string;
						recurringInterval: "month" | "year" | null;
						startedAt: string | null;
						status: string;
					};
				},
				any
			>;
			upsertCustomer: FunctionReference<
				"mutation",
				"internal",
				{ id: string; metadata?: Record<string, any>; userId: string },
				string
			>;
		};
	};
};
