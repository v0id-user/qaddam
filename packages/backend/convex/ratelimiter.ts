import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const rateLimiter = new RateLimiter(components.rateLimiter, {
	freeTrialSignUp: { kind: "fixed window", rate: 1, period: HOUR * 24 },
});

export default rateLimiter;
