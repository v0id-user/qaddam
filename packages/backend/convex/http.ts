import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { polar } from "./polar";
import { logger } from "./lib/axiom";
const http = httpRouter();

auth.addHttpRoutes(http);
polar.registerRoutes(http, {
	onSubscriptionUpdated: async (ctx, event) => {
		// Handle subscription updates, like cancellations.
		// Note that a cancelled subscription will not be deleted from the database,
		// so this information remains available without a hook, eg., via
		// `getCurrentSubscription()`.
		if (event.data.customerCancellationReason) {
			logger.info("Customer cancelled:", {
				customerCancellationReason: event.data.customerCancellationReason,
			});
		}
	},
	onSubscriptionCreated: async (ctx, event) => {
		// Handle new subscriptions
		logger.info("Customer subscribed:", { customerId: event.data.customerId });
	},
});

export default http;
