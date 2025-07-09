"use node";

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "@/_generated/api";
import schema from "@/schema";
import { modules } from "@/test.setup";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const ENV_PATH = path.resolve(__dirname, "../.env.local");
console.log(ENV_PATH);
dotenv.config({ path: ENV_PATH });

// Mock CV profile data
const mockCvProfile = {
	skills: ["React", "TypeScript", "JavaScript", "CSS", "Next.js", "Node.js"],
	experience_level: "senior",
	job_titles: ["Frontend Developer", "Full Stack Developer", "Senior Developer"],
	industries: ["Technology", "Software Development", "Web Development"],
	keywords: ["frontend", "react", "typescript", "web development", "ui/ux"],
	education: "Bachelor's in Computer Science",
	years_of_experience: 6,
	preferred_locations: ["Riyadh", "Dubai", "Remote"],
};

test("job search - tune search keywords extraction", {
	timeout: 120000
}, async () => {
	const t = convexTest(schema, modules);
	const result = await t.action(internal.jobs.actions.tuneSearch.aiTuneJobSearch, {
		cvProfile: mockCvProfile,
	});

	console.log("Tune Search Result:", result);

	expect(result).toBeDefined();
	expect(result.primary_keywords).toBeInstanceOf(Array);
	expect(result.secondary_keywords).toBeInstanceOf(Array);
	expect(result.search_terms).toBeInstanceOf(Array);
	expect(result.job_title_keywords).toBeInstanceOf(Array);
	expect(result.technical_skills).toBeInstanceOf(Array);
	expect(result.primary_keywords.length).toBeGreaterThan(0);
});

test("job search - search jobs with keywords", {
	timeout: 120000
}, async () => {
	const t = convexTest(schema, modules);
	
	// Mock search parameters (what tuneSearch would return)
	const mockSearchParams = {
		primary_keywords: ["React", "TypeScript", "Frontend"],
		secondary_keywords: ["JavaScript", "CSS", "Web Development"],
		search_terms: ["React Developer", "Frontend Engineer", "TypeScript"],
		job_title_keywords: ["Senior Developer", "Frontend Developer", "Full Stack"],
		technical_skills: ["React", "TypeScript", "JavaScript", "Node.js"],
	};

	const result = await t.action(internal.jobs.actions.searchJobs.aiSearchJobs, {
		searchParams: mockSearchParams,
		cvProfile: mockCvProfile,
	});

	console.log("Search Jobs Result:", result);

	expect(result).toBeDefined();
	expect(result.jobs).toBeInstanceOf(Array);
	expect(result.totalFound).toBeGreaterThanOrEqual(0);
	expect(result.searchParams).toEqual(mockSearchParams);
	expect(result).toHaveProperty('jobs');
	expect(result).toHaveProperty('totalFound');
	expect(result).toHaveProperty('searchParams');
});

test("job search - combine and rank results", {
	timeout: 120000
}, async () => {
	const t = convexTest(schema, modules);

	// Mock job results (what searchJobs would return)
	const mockJobResults = {
		jobs: [
			{
				id: "job-1",
				title: "Senior React Developer",
				company: "Test Company",
				location: "Riyadh, Saudi Arabia",
				description: "Senior React Developer position with TypeScript",
				requirements: [],
				salary: "25000 SAR",
				type: "full_time" as const,
				remote: false,
				url: "",
				postedDate: new Date().toISOString(),
				matchScore: 85,
				benefits: [],
				matchedSkills: ["React", "TypeScript"],
				missingSkills: ["Node.js"],
				experienceMatch: "Good match",
				locationMatch: "Perfect match",
			},
			{
				id: "job-2", 
				title: "Frontend Engineer",
				company: "Tech Startup",
				location: "Dubai, UAE",
				description: "Frontend Engineer with React experience",
				requirements: [],
				salary: "20000 AED",
				type: "full_time" as const,
				remote: true,
				url: "",
				postedDate: new Date().toISOString(),
				matchScore: 78,
				benefits: [],
				matchedSkills: ["React"],
				missingSkills: ["TypeScript", "Node.js"],
				experienceMatch: "Good match",
				locationMatch: "Good match",
			},
		],
		totalFound: 2,
		searchParams: {
			primary_keywords: ["React", "TypeScript"],
			secondary_keywords: ["JavaScript", "CSS"],
			search_terms: ["React Developer"],
			job_title_keywords: ["Senior Developer"],
			technical_skills: ["React", "TypeScript"],
		},
	};

	const mockSearchParams = {
		primary_keywords: ["React", "TypeScript"],
		secondary_keywords: ["JavaScript", "CSS"],
		search_terms: ["React Developer"],
		job_title_keywords: ["Senior Developer"],
		technical_skills: ["React", "TypeScript"],
	};

	const result = await t.action(internal.jobs.actions.combineResults.aiCombineJobResults, {
		jobResults: mockJobResults,
		cvProfile: mockCvProfile,
		searchParams: mockSearchParams,
	});

	console.log("Combine Results:", result);

	expect(result).toBeDefined();
	expect(result.jobs).toBeInstanceOf(Array);
	expect(result.totalFound).toBeGreaterThan(0);
	expect(result.insights).toBeDefined();
	expect(result.insights.total_relevant).toBeGreaterThanOrEqual(0);
	expect(result.searchParams).toBeDefined();
	expect(result.searchParams.optimized_keywords).toBeInstanceOf(Array);
});

test("full job search workflow integration", {
	timeout: 180000
}, async () => {
	const t = convexTest(schema, modules);
	
	console.log("Starting full workflow integration test...");

	// Step 1: Test keyword extraction
	const tuneResult = await t.action(internal.jobs.actions.tuneSearch.aiTuneJobSearch, {
		cvProfile: mockCvProfile,
	});
	
	console.log("Step 1 - Tune Search completed:", tuneResult);
	expect(tuneResult).toBeDefined();
	expect(tuneResult.primary_keywords).toBeInstanceOf(Array);

	// Step 2: Test job search with extracted keywords
	const searchResult = await t.action(internal.jobs.actions.searchJobs.aiSearchJobs, {
		searchParams: tuneResult,
		cvProfile: mockCvProfile,
	});
	
	console.log("Step 2 - Search Jobs completed:", searchResult);
	expect(searchResult).toBeDefined();
	expect(searchResult.jobs).toBeInstanceOf(Array);

	// Step 3: Test result combination and ranking (using mock data if no real jobs found)
	const testJobResults = searchResult.jobs.length > 0 ? searchResult : {
		jobs: [{
			id: "mock-job-1",
			title: "Mock React Developer",
			company: "Mock Company",
			location: "Test Location",
			description: "Mock job description with React and TypeScript",
			requirements: [],
			salary: "50000 USD",
			type: "full_time" as const,
			remote: false,
			url: "",
			postedDate: new Date().toISOString(),
			matchScore: 80,
			benefits: [],
			matchedSkills: ["React", "TypeScript"],
			missingSkills: [],
			experienceMatch: "Good match",
			locationMatch: "Good match",
		}],
		totalFound: 1,
		searchParams: tuneResult,
	};

	const finalResult = await t.action(internal.jobs.actions.combineResults.aiCombineJobResults, {
		jobResults: testJobResults,
		cvProfile: mockCvProfile,
		searchParams: tuneResult,
	});
	
	console.log("Step 3 - Combine Results completed:", finalResult);
	expect(finalResult).toBeDefined();
	expect(finalResult.jobs).toBeInstanceOf(Array);
	expect(finalResult.insights).toBeDefined();

	console.log("✅ Full workflow integration test completed successfully!");
});
