// AI SDK schema objects to replace Zod schemas for generateObject calls
export const keywordExtractionSchema = {
  type: "object",
  properties: {
    primary_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Main keywords from skills and experience"
    },
    secondary_keywords: {
      type: "array", 
      items: { type: "string" },
      description: "Supporting keywords and related terms"
    },
    search_terms: {
      type: "array",
      items: { type: "string" },
      description: "Specific search terms for job database queries"
    },
    job_title_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Job titles and role names"
    },
    technical_skills: {
      type: "array",
      items: { type: "string" },
      description: "Technical skills and technologies"
    },
    soft_skills: {
      type: "array",
      items: { type: "string" },
      description: "Soft skills and interpersonal abilities"
    },
    industry_terms: {
      type: "array",
      items: { type: "string" },
      description: "Industry-specific terminology"
    },
    location_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Location-related keywords"
    },
    company_type_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Company type and size keywords"
    },
    experience_level_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Experience level indicators"
    },
    education_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Education and qualification keywords"
    },
    certification_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Certification and credential keywords"
    },
    salary_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Salary and compensation keywords"
    },
    benefit_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Benefits and perks keywords"
    },
    work_arrangement_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Work arrangement keywords (remote, hybrid, etc.)"
    }
  },
  required: [
    "primary_keywords",
    "secondary_keywords", 
    "search_terms",
    "job_title_keywords",
    "technical_skills",
    "soft_skills",
    "industry_terms",
    "location_keywords",
    "company_type_keywords",
    "experience_level_keywords",
    "education_keywords",
    "certification_keywords",
    "salary_keywords",
    "benefit_keywords",
    "work_arrangement_keywords"
  ]
};

export const cvProfileSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      description: "List of skills"
    },
    experience_level: {
      type: "string",
      enum: ["entry", "mid", "senior", "executive"],
      description: "Experience level"
    },
    job_titles: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      description: "Previous job titles"
    },
    industries: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      description: "Industries worked in"
    },
    keywords: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      description: "Relevant keywords"
    },
    education: {
      type: "string",
      minLength: 1,
      description: "Education background"
    },
    years_of_experience: {
      type: "number",
      minimum: 0,
      description: "Years of experience"
    },
    preferred_locations: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      description: "Preferred work locations"
    }
  },
  required: [
    "skills",
    "experience_level",
    "job_titles", 
    "industries",
    "keywords",
    "education",
    "years_of_experience",
    "preferred_locations"
  ]
};

export const jobRankingSchema = {
  type: "object",
  properties: {
    ranked_jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          match_reasons: {
            type: "array",
            items: { type: "string" }
          },
          concerns: {
            type: "array", 
            items: { type: "string" }
          }
        },
        required: ["id", "match_reasons", "concerns"]
      }
    },
    insights: {
      type: "object",
      properties: {
        total_relevant: { type: "number" },
        avg_match_score: { type: "number" },
        top_skills_in_demand: {
          type: "array",
          items: { type: "string" }
        },
        salary_insights: { type: "string" },
        market_observations: { type: "string" }
      },
      required: [
        "total_relevant",
        "avg_match_score", 
        "top_skills_in_demand",
        "salary_insights",
        "market_observations"
      ]
    }
  },
  required: ["ranked_jobs", "insights"]
};

export const batchJobAnalysisSchema = {
  type: "object",
  properties: {
    jobAnalyses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          jobId: { type: "string" },
          experienceMatch: {
            type: "object",
            properties: {
              match_level: {
                type: "string",
                enum: ["perfect", "good", "partial", "poor", "mismatch"]
              },
              match_score: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              match_reasons: {
                type: "array",
                items: { type: "string" },
                minItems: 1
              },
              experience_gaps: {
                type: "array",
                items: { type: "string" }
              },
              recommendation: { type: "string" }
            },
            required: [
              "match_level",
              "match_score",
              "match_reasons",
              "experience_gaps",
              "recommendation"
            ]
          },
          locationMatch: {
            type: "object",
            properties: {
              match_score: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              match_reasons: {
                type: "array",
                items: { type: "string" },
                minItems: 1
              },
              work_type_match: { type: "string" }
            },
            required: ["match_score", "match_reasons"]
          },
          benefits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                details: { type: "string" }
              },
              required: ["description"]
            }
          },
          requirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                details: { type: "string" }
              },
              required: ["description"]
            }
          },
          dataExtraction: {
            type: "object",
            properties: {
              salary: {
                type: "object",
                properties: {
                  is_salary_mentioned: { type: "boolean" },
                  min: { type: ["number", "null"] },
                  max: { type: ["number", "null"] },
                  currency: { type: "string" }
                },
                required: ["is_salary_mentioned", "min", "max", "currency"]
              },
              company: {
                type: "object",
                properties: {
                  is_company_mentioned: { type: "boolean" },
                  name: { type: ["string", "null"] }
                },
                required: ["is_company_mentioned", "name"]
              },
              job_type: {
                type: "object",
                properties: {
                  type: { type: "string" }
                },
                required: ["type"]
              }
            },
            required: ["salary", "company", "job_type"]
          }
        },
        required: ["jobId", "experienceMatch", "locationMatch", "benefits", "requirements", "dataExtraction"]
      }
    }
  },
  required: ["jobAnalyses"]
};