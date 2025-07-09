'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import JobCard from '@/components/dashboard/JobCard';
import JobMatchInsights from '@/components/dashboard/JobMatchInsights';
import type { JobResult } from './types';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { JobType } from '@qaddam/backend/convex/types/jobs';
import type { WorkflowId } from '@qaddam/backend/convex/jobs/workflow';

interface JobResultsProps {
  workflowId: WorkflowId;
  onBackToUpload: () => void;
}

const JobResults = ({ workflowId, onBackToUpload }: JobResultsProps) => {

  const t = useTranslations('dashboard');
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const jobResults = useQuery(api.jobs.data.getJobResults, {
    workflowId,
  });


  if (!workflowId) {
    return null;
  }

  const handleJobClick = (job: JobResult) => {
    setSelectedJob(job);
    setIsInsightsOpen(true);
  };

  const handleCloseInsights = () => {
    setIsInsightsOpen(false);
    setSelectedJob(null);
  };

  // Show loading state if data is still loading
  if (jobResults === undefined) {
    return (
      <div className="from-accent/30 via-background to-secondary/20 min-h-screen bg-gradient-to-br px-6 py-24 rounded-xl">
        <div className="mx-auto max-w-6xl text-center">
          <div className="text-foreground text-xl">Loading job results...</div>
        </div>
      </div>
    );
  }

  // Show no results if query returned null
  if (jobResults === null) {
    return (
      <div className="from-accent/30 via-background to-secondary/20 min-h-screen bg-gradient-to-br px-6 py-24 rounded-xl">
        <div className="mx-auto max-w-6xl text-center">
          <div className="text-foreground text-xl">No job results found for this workflow.</div>
          <Button
            onClick={onBackToUpload}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 mt-4 rounded-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('job_results.upload_new_cv')}
          </Button>
        </div>
      </div>
    );
  }

  const { searchResults, jobResults: jobs } = jobResults;
  const totalFound = searchResults?.totalFound || 0;

  // Simple mapping from database fields to JobResult structure
  const jobsData: JobResult[] =
    jobs?.map(job => ({
      id: job.externalId,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      descriptionHtml: job.descriptionHtml,
      requirements: job.requirements,
      salary: job.salary,
      type: job.type as JobType,
      remote: job.remote,
      url: job.url,
      postedDate: job.postedDate,
      matchScore: job.matchScore,
      benefits: job.benefits,
      matchedSkills: job.matchedSkills,
      missingSkills: job.missingSkills,
      experienceMatch: job.experienceMatch,
      locationMatch: job.locationMatch,
      aiMatchReasons: job.aiMatchReasons,
      aiConcerns: job.aiConcerns,
      aiRecommendation: job.aiRecommendation as JobResult['aiRecommendation'],
    })) || [];

  return (
    <div className="from-accent/30 via-background to-secondary/20 min-h-screen bg-gradient-to-br px-6 py-24 rounded-xl">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            {t('job_results.title')}
          </h1>
          <p className="text-muted-foreground mb-4 text-xl leading-relaxed">
            {t('job_results.subtitle')}
          </p>
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="bg-primary/10 inline-flex items-center rounded-full px-4 py-2">
              <span className="text-primary font-semibold">
                {t('job_results.found_jobs', { count: totalFound })}
              </span>
            </div>
            <Button
              onClick={onBackToUpload}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 rounded-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('job_results.upload_new_cv')}
            </Button>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobsData?.map((job: JobResult) => (
            <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
          ))}
        </div>

        {/* Job Match Insights Modal */}
        {isInsightsOpen && selectedJob && (
          <JobMatchInsights job={selectedJob} onClose={handleCloseInsights} />
        )}
      </div>
    </div>
  );
};

export default JobResults;
