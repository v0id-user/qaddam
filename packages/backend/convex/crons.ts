import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"Add new jobs listing",
	{ hours: 24 * 7 }, // every week | This thing is expensive, so we do it weekly
	internal.listings.action.addNewJobsListingAction,
	{},
);

export default crons;
