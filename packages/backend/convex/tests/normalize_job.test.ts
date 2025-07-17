import { describe, it, expect } from "vitest";
import { normalize_job } from "../normalize_job";

describe("normalize_job", () => {
  describe("LinkedIn job normalization", () => {
    it("should normalize a valid LinkedIn job", () => {
      const linkedInJob = {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        companyName: "Tech Corp",
        descriptionHtml: "<p>Great opportunity</p>",
        descriptionText: "Great opportunity",
        location: "San Francisco, CA",
        salaryInfo: ["$100,000 - $150,000"],
        postedAt: "2024-01-15T10:00:00Z",
      };

      const result = normalize_job(linkedInJob, "linked-in");

      expect(result).toEqual({
        name: "Software Engineer",
        descriptionHtml: "<p>Great opportunity</p>",
        description: "Great opportunity",
        location: "San Francisco, CA",
        salary: 125000, // Average of range
        currency: "USD",
        source: "LinkedIn",
        sourceId: "123456",
        datePosted: new Date("2024-01-15T10:00:00Z").getTime(),
        sourceUrl: "https://linkedin.com/jobs/123456",
        sourceName: "Tech Corp",
        sourceLogo: undefined,
        sourceDescription: undefined,
        sourceLocation: "San Francisco, CA",
      });
    });

    it("should return null for LinkedIn job missing required fields", () => {
      const invalidJob = {
        title: "Software Engineer",
        // Missing id and link
      };

      const result = normalize_job(invalidJob, "linked-in");
      expect(result).toBeNull();
    });

    it("should handle LinkedIn job with no salary info", () => {
      const linkedInJob = {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        companyName: "Tech Corp",
        descriptionText: "Great opportunity",
        location: "San Francisco, CA",
      };

      const result = normalize_job(linkedInJob, "linked-in");

      expect(result).toEqual(
        expect.objectContaining({
          name: "Software Engineer",
          salary: undefined,
          currency: undefined,
        })
      );
    });
  });

  describe("Indeed job normalization", () => {
    it("should normalize a valid Indeed job", () => {
      const indeedJob = {
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
      };

      const result = normalize_job(indeedJob, "indeed");

      expect(result).toEqual({
        name: "Frontend Developer",
        descriptionHtml: "",
        description: "Full-time, Remote",
        location: "New York, NY",
        salary: 100000, // Average of range
        currency: "USD",
        source: "Indeed",
        sourceId: "987654",
        datePosted: undefined,
        sourceUrl: "https://indeed.com/jobs/987654",
        sourceName: "Web Solutions Inc",
        sourceLogo: "https://logo.com/company.png",
        sourceDescription: "Leading web development company",
        sourceLocation: "New York, NY",
      });
    });

    it("should return null for Indeed job missing required fields", () => {
      const invalidJob = {
        company: "Web Solutions Inc",
        // Missing positionName and url
      };

      const result = normalize_job(invalidJob, "indeed");
      expect(result).toBeNull();
    });

    it("should handle Indeed job with no salary", () => {
      const indeedJob = {
        positionName: "Frontend Developer",
        url: "https://indeed.com/jobs/987654",
        company: "Web Solutions Inc",
        location: "New York, NY",
      };

      const result = normalize_job(indeedJob, "indeed");

      expect(result).toEqual(
        expect.objectContaining({
          name: "Frontend Developer",
          salary: undefined,
          currency: undefined,
        })
      );
    });
  });

  describe("Unknown source", () => {
    it("should return null for unknown source", () => {
      const job = {
        title: "Some Job",
        link: "https://example.com/job",
      };

      const result = normalize_job(job, "unknown-source");
      expect(result).toBeNull();
    });
  });

  describe("Salary parsing", () => {
    it("should parse salary ranges correctly", () => {
      const linkedInJob = {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        salaryInfo: ["$90,000 - $110,000"],
      };

      const result = normalize_job(linkedInJob, "linked-in");
      expect(result?.salary).toBe(100000);
      expect(result?.currency).toBe("USD");
    });

    it("should parse single salary amounts", () => {
      const linkedInJob = {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        salaryInfo: ["$95,000"],
      };

      const result = normalize_job(linkedInJob, "linked-in");
      expect(result?.salary).toBe(95000);
      expect(result?.currency).toBe("USD");
    });

    it("should handle different currency symbols", () => {
      const linkedInJob = {
        id: "123456",
        title: "Software Engineer",
        link: "https://linkedin.com/jobs/123456",
        salaryInfo: ["£50,000 - £70,000"],
      };

      const result = normalize_job(linkedInJob, "linked-in");
      expect(result?.salary).toBe(60000);
      expect(result?.currency).toBe("GBP");
    });
  });
});