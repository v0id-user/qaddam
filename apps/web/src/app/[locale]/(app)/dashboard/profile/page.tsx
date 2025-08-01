'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@qaddam/backend/convex/_generated/api';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation } from 'convex/react';
import JobCard from '@/components/dashboard/JobCard';
import JobMatchInsights from '@/components/dashboard/JobMatchInsights';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import type { Id } from '@qaddam/backend/convex/_generated/dataModel';

export default function ProfilePage() {
  const t = useTranslations('dashboard');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  // Job details modal state
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Get saved jobs
  const savedJobsData = useQuery(api.profile.getSavedJobs, {
    limit: 50,
    offset: 0,
  });

  // Mutations
  const unsaveJobMutation = useMutation(api.profile.unsaveJob);

  const isLoading = savedJobsData === undefined;
  // Use useMemo to avoid changing dependencies on every render (see lint warning)
  const savedJobs = useMemo(() => savedJobsData?.savedJobs || [], [savedJobsData]);
  const totalCount = savedJobsData?.totalCount || 0;

  // Handle removing a single job
  const handleRemoveJob = useCallback(
    async (jobListingId: string) => {
      try {
        await unsaveJobMutation({ jobListingId: jobListingId as Id<'jobListings'> });
        toast.success(t('job_results.job_unsaved'));
      } catch (error) {
        console.error('Error removing saved job:', error);
        toast.error(t('job_results.errors.save_failed'));
      }
    },
    [unsaveJobMutation, t]
  );

  // Handle save toggle from JobCard
  const handleSaveToggle = useCallback(
    (jobId: string, currentlySaved: boolean) => {
      if (currentlySaved) {
        handleRemoveJob(jobId);
      }
    },
    [handleRemoveJob]
  );

  // Handle bulk remove
  const handleBulkRemove = useCallback(async () => {
    if (selectedJobs.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedJobs).map(jobId =>
          unsaveJobMutation({ jobListingId: jobId as Id<'jobListings'> })
        )
      );
      setSelectedJobs(new Set());
      toast.success(t('profile.saved_jobs.bulk_removed', { count: selectedJobs.size }));
    } catch (error) {
      console.error('Error removing saved jobs:', error);
      toast.error(t('job_results.errors.save_failed'));
    }
  }, [selectedJobs, unsaveJobMutation, t]);

  // Toggle job selection
  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobs(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(jobId)) {
        newSelected.delete(jobId);
      } else {
        newSelected.add(jobId);
      }
      return newSelected;
    });
  }, []);

  // Select all jobs
  const selectAllJobs = useCallback(() => {
    const allJobIds = savedJobs.map(saved => saved.jobListing._id);
    setSelectedJobs(new Set(allJobIds));
  }, [savedJobs]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedJobs(new Set());
  }, []);

  // Handle job details modal
  const handleJobClick = useCallback((job: JobResult) => {
    setSelectedJob(job);
    setIsInsightsOpen(true);
  }, []);

  const handleCloseInsights = useCallback(() => {
    setIsInsightsOpen(false);
    setSelectedJob(null);
  }, []);

  // Convert saved job to JobResult format for JobCard
  const convertToJobResult = (savedJob: (typeof savedJobs)[0]): JobResult => {
    return {
      jobListingId: savedJob.jobListing._id,
      benefits: [],
      requirements: [],
      matchedSkills: [],
      missingSkills: [],
      experienceMatch: 'good_match',
      experienceMatchScore: 0.8,
      experienceMatchReasons: [],
      experienceGaps: [],
      locationMatch: 'location_match',
      locationMatchScore: 0.9,
      locationMatchReasons: [],
      workTypeMatch: true,
      aiMatchReasons: [],
      aiConcerns: [],
      aiRecommendation: 'recommended',
    };
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card/50 border-b px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
                {t('profile.saved_jobs.title')}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('profile.saved_jobs.subtitle')}
              </p>
            </div>

            {!isLoading && totalCount > 0 && (
              <div className="flex items-center space-x-1 space-x-reverse">
                <Heart className="h-5 w-5 fill-current text-red-500" />
                <span className="text-muted-foreground text-sm">
                  {t('profile.saved_jobs.count', { count: totalCount })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {!isLoading && savedJobs.length > 0 && (
        <div className="bg-card/30 border-b px-6 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedJobs.size === savedJobs.length ? clearSelection : selectAllJobs}
                >
                  {selectedJobs.size === savedJobs.length
                    ? t('profile.saved_jobs.deselect_all')
                    : t('profile.saved_jobs.select_all')}
                </Button>

                {selectedJobs.size > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {t('profile.saved_jobs.selected', { count: selectedJobs.size })}
                  </span>
                )}
              </div>

              {selectedJobs.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkRemove}
                  className="flex items-center space-x-1 space-x-reverse"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t('profile.saved_jobs.remove_selected')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6">
        <div className="mx-auto max-w-7xl">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
                <span className="text-muted-foreground">{t('profile.saved_jobs.loading')}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && savedJobs.length === 0 && (
            <div className="py-12 text-center">
              <div className="bg-accent/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full p-6">
                <Heart className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                {t('profile.saved_jobs.empty.title')}
              </h3>
              <p className="text-muted-foreground mx-auto mb-6 max-w-md">
                {t('profile.saved_jobs.empty.description')}
              </p>
              <Button onClick={() => (window.location.href = '/dashboard/jobs')}>
                {t('profile.saved_jobs.empty.browse_jobs')}
              </Button>
            </div>
          )}

          {/* Saved Jobs Grid */}
          {!isLoading && savedJobs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedJobs.map(savedJob => (
                <div key={savedJob._id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(savedJob.jobListing._id)}
                      onChange={() => toggleJobSelection(savedJob.jobListing._id)}
                      className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                    />
                  </div>

                  {/* Job Card */}
                  <JobCard
                    job={convertToJobResult(savedJob)}
                    onClick={() => handleJobClick(convertToJobResult(savedJob))}
                    isSaved={true}
                    onSaveToggle={handleSaveToggle}
                  />

                  {/* Saved Date */}
                  <div className="text-muted-foreground mt-2 text-center text-xs">
                    {t('profile.saved_jobs.saved_on', {
                      date: new Date(savedJob.savedAt).toLocaleDateString(),
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Match Insights Modal */}
      {isInsightsOpen && selectedJob && (
        <JobMatchInsights job={selectedJob} onClose={handleCloseInsights} />
      )}
    </div>
  );
}
