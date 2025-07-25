import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
// 	"Add new jobs listing",
// 	{ hours: 24 }, // every 24 hours
// 	internal.listings.action.addNewJobsListingAction,
// 	{},
// );

export default crons;
