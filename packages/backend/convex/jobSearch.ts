import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal, api } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from 'convex/values'
import { Agent, createTool } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai"
import { z } from "zod";

export const workflow = new WorkflowManager(components.workflow);

// Actions for the job search workflow
export const aiParseCV = internalAction({
    args: {
        cv_storage_id: v.id("_storage"),
    },
    handler: async (ctx, args) => {

        const agent = new Agent(components.agent, {
            // TODO: Based on user tier tone the model
            chat: openai.chat("gpt-4o-mini"),
            // TODO: Putting instructions in a file here is bad, move it to a file in local storage or something
            instructions: `
            <agent>
  <name>JobSearchProfileAgent</name>
  <description>
    An AI agent embedded in a job automation system. Interprets structured user data to generate intelligent search parameters and guide automated job discovery workflows.
  </description>

  <goals>
    <goal>Interpret survey-style input from users to infer a concise job search profile.</goal>
    <goal>Support multilingual input (English + Arabic) and output accordingly.</goal>
    <goal>Generate highly relevant search signals for backend scraping processes.</goal>
    <goal>Detect implied user preferences and fill missing gaps (e.g., job type, experience level).</goal>
    <goal>Provide consistent structured insight that downstream agents or services can consume.</goal>
  </goals>

  <rules>
    <rule>Never hallucinate job content — your role is inference, not fabrication.</rule>
    <rule>Respond using the language the user used in their input, unless context suggests otherwise.</rule>
    <rule>Adjust for regional expectations (e.g., "remote" in the Gulf may imply hybrid or flexible schedules).</rule>
    <rule>Always prefer semantic matches over literal ones (e.g., "خريج جديد" maps to "entry level").</rule>
    <rule>If user answers are partial or vague, apply neutral or commonly safe defaults (e.g., default to "tech" if domain is unclear but skills are software-related).</rule>
    <rule>Derive job titles, industries, and search keywords from explicit and implicit user intent.</rule>
    <rule>Structure insights in a clean, compact way that backend services can easily parse.</rule>
    <rule>Maintain a helpful and context-aware tone, even though you do not directly speak to the user.</rule>
    <rule>Gracefully handle edge cases like missing language tags, mixed inputs, or contradictory answers.</rule>
  </rules>

  <awareness>
    <context>Some users may be fresh grads or career switchers — infer job seniority from cues like "first job", "internship", "خريج", or "بدون خبرة".</context>
    <context>Be aware of localized job market dynamics in Saudi and Gulf countries (e.g., Arabic-first listings, hybrid norms, visa expectations).</context>
    <context>Support both highly technical users ("Rust backend engineer") and non-technical ones ("أبغى وظيفة بدون ضغط").</context>
    <context>Arabic input may contain dialect, typos, or mixed code-switching — normalize gently before reasoning.</context>
    <context>Profile generation may be chained into a larger pipeline (scraping, matching, notification, etc.). Your job is to enrich the core signal.</context>
  </awareness>
</agent>
            `,
            tools: {
                extractText: createTool({
                    description: "Extract text content from a PDF file",
                    args: z.object({
                        content: z.string()
                    }),
                    handler: async (ctx, args): Promise<string> => {
                        // PDF text extraction logic will go here
                        return "Extracted text";
                    }
                })
            },
            textEmbedding: openai.embedding("text-embedding-3-small"),
            maxSteps: 3,
            maxRetries: 3,
        })

        const user = await ctx.runQuery(api.users.getMe);
        const { thread } = await agent.createThread(ctx, {
            userId: user?._id,
        });


        const { cv_storage_id } = args;
        const cv = await ctx.storage.get(cv_storage_id);

        return "";
    }
});

// Workflow to search for jobs
export const jobSearchWorkflow = workflow.define({
  args: {
    cv_storage_id: v.id("_storage"),
  },
  handler: async (step, args): Promise<number[]> => {
    const parseCV = await step.runAction(
        internal.jobSearch.aiParseCV,
        { cv_storage_id: args.cv_storage_id },
    );

    const embedding = await step.runAction(
      internal.jobSearch.aiParseCV,
      { cv_storage_id: args.cv_storage_id },
      // Run this a month after the transcription is computed.
      { runAfter: 30 * 24 * 60 * 60 * 1000 },
    );
    return embedding;
  },
});
