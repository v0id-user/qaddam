import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const rateLimiter = new RateLimiter(components.rateLimiter, {
	freeTrialSignUp: { kind: "fixed window", rate: 1, period: HOUR * 24 }, // 1 job per day
	proLimit: { kind: "fixed window", rate: 5, period: HOUR * 24 }, // 5 jobs per day
	proJobSearch: { kind: "fixed window", rate: 2, period: HOUR * 24 * 7 }, // 2 jobs per week
});

export default rateLimiter;
