import { defineApp } from "convex/server";
import workflow from "@convex-dev/workflow/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import polar from "@convex-dev/polar/convex.config";

const app = defineApp();
app.use(workflow);
app.use(rateLimiter);
app.use(polar);

export default app;
