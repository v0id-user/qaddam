'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import JobCard from '@/components/dashboard/JobCard';
import JobMatchInsights from '@/components/dashboard/JobMatchInsights';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { WorkflowId } from '@qaddam/backend/convex/jobs/workflow';

interface JobResultsProps {
  workflowId: WorkflowId;
  onBackToUpload: () => void;
}

const JobResults = ({ workflowId, onBackToUpload }: JobResultsProps) => {
  const t = useTranslations('dashboard');
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const jobResults = useQuery(api.job_data.getJobResultsWithAnalysis, {
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
      <div className="from-accent/20 via-background to-secondary/10 min-h-screen rounded-xl bg-gradient-to-br px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="text-foreground text-lg">{t('job_results.loading.title')}</div>
        </div>
      </div>
    );
  }

  // Show no results if query returned null
  if (jobResults === null) {
    return (
      <div className="from-accent/20 via-background to-secondary/10 min-h-screen rounded-xl bg-gradient-to-br px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="text-foreground text-lg">{t('job_results.errors.no_results')}</div>
          <Button
            onClick={onBackToUpload}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 mt-4 rounded-full"
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
  const jobsData: JobResult[] = (jobs ?? []).map<JobResult>((job) => ({
    jobListingId: job.jobListingId,
    benefits: job.benefits ?? [],
    matchedSkills: job.matchedSkills ?? [], 
    missingSkills: job.missingSkills ?? [],
    experienceMatch: job.experienceMatch ?? 'not_specified',
    experienceMatchScore: job.experienceMatchScore ?? 0,
    experienceMatchReasons: job.experienceMatchReasons ?? [],
    locationMatch: job.locationMatch ?? 'not_specified', 
    locationMatchScore: job.locationMatchScore ?? 0,
    locationMatchReasons: job.locationMatchReasons ?? [],
    workTypeMatch: job.workTypeMatch ?? false,
    requirements: job.requirements ?? [],
    aiMatchReasons: job.aiMatchReasons ?? [],
    aiConcerns: job.aiConcerns ?? [],
    aiRecommendation: job.aiRecommendation as JobResult['aiRecommendation'] ?? 'consider'
  }));

  return (
    <div className="from-accent/20 via-background to-secondary/10 min-h-screen rounded-xl bg-gradient-to-br px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            {t('job_results.title')}
          </h1>
          <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
            {t('job_results.subtitle')}
          </p>
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="bg-primary/8 inline-flex items-center rounded-full px-4 py-2">
              <span className="text-primary text-sm font-medium">
                {t('job_results.found_jobs', { count: totalFound })}
              </span>
            </div>
            <Button
              onClick={onBackToUpload}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('job_results.upload_new_cv')}
            </Button>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobsData?.map((job) => (
            <JobCard key={job.jobListingId} job={job} onClick={() => handleJobClick(job)} />
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
