import type { JobSource } from "../jobs/types";
import { ApifyClient } from 'apify-client';

export default class ApifyDriver {
  private readonly jobSource: JobSource;
  private readonly client: ApifyClient;
  
  constructor(jobSource: JobSource) {
    this.jobSource = jobSource;
    // Base client
    this.client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    }) 
  }
}