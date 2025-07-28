'use client';

import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';
import { useState, useCallback, useEffect } from 'react';
import {
  Search,
  MapPin,
  Building,
  ChevronDown,
  Heart,
  Loader2,
  ExternalLink,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Doc, Id } from '@qaddam/backend/convex/_generated/dataModel';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation } from 'convex/react';
import JobMatchInsights from '@/components/dashboard/JobMatchInsights';

const FAANG_COMPANIES = [
  'Google',
  'Meta',
  'Amazon',
  'Netflix',
  'Apple',
  'Microsoft',
  'Tesla',
  'OpenAI',
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Highlight search terms in text
function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;

  const terms = searchTerm
    .toLowerCase()
    .split(' ')
    .filter(term => term.length > 2);
  let highlightedText = text;

  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
    );
  });

  return highlightedText;
}

export default function JobsPage() {
  const t = useTranslations('dashboard');
  const [searchKeyword, setSearchKeyword] = useQueryState('search', { defaultValue: '' });
  const [locationFilter, setLocationFilter] = useQueryState('location', { defaultValue: '' });
  const [companyFilter, setCompanyFilter] = useQueryState('company', { defaultValue: '' });
  const me = useQuery(api.users.getMe);

  // Local state for UI
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [customCompany, setCustomCompany] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Job details modal state
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Debounce search inputs for better UX
  const debouncedSearch = useDebounce(searchKeyword, 500);
  const debouncedLocation = useDebounce(locationFilter, 500);
  const debouncedCompany = useDebounce(companyFilter, 300);

  // Use the search query
  const searchResults = useQuery(api.job_data.searchJobListings, {
    searchQuery: debouncedSearch || undefined,
    companyName: debouncedCompany || undefined,
    location: debouncedLocation || undefined,
    limit: 20,
  });

  // Mutations for saving/unsaving jobs
  const saveJobMutation = useMutation(api.profile.saveJob);
  const unsaveJobMutation = useMutation(api.profile.unsaveJob);

  // Loading state
  const isLoading = searchResults === undefined;

  // Check if user is actively searching/filtering
  const hasActiveFilters = debouncedSearch || debouncedLocation || debouncedCompany;
  const isSearching =
    searchKeyword !== debouncedSearch ||
    locationFilter !== debouncedLocation ||
    companyFilter !== debouncedCompany;

  // Handle save/unsave job
  const handleSaveJob = useCallback(
    async (jobId: string, currentlySaved: boolean) => {
      try {
        if (currentlySaved) {
          // Unsave the job
          await unsaveJobMutation({ jobListingId: jobId as Id<'jobListings'> });
          setSavedJobs(prev => {
            const newSaved = new Set(prev);
            newSaved.delete(jobId);
            return newSaved;
          });
          toast.success(t('job_results.job_unsaved'));
        } else {
          // Save the job
          await saveJobMutation({ jobListingId: jobId as Id<'jobListings'> });
          setSavedJobs(prev => new Set(prev).add(jobId));
          toast.success(t('job_results.job_saved'));
        }
      } catch (error) {
        console.error('Error saving/unsaving job:', error);
        toast.error(t('job_results.errors.save_failed'));
      }
    },
    [t, saveJobMutation, unsaveJobMutation]
  );

  const handleCompanySelect = useCallback(
    (company: string) => {
      setCompanyFilter(company);
      setCustomCompany('');
    },
    [setCompanyFilter]
  );

  const handleCustomCompanySubmit = useCallback(() => {
    if (customCompany.trim()) {
      setCompanyFilter(customCompany.trim());
      setCustomCompany('');
    }
  }, [customCompany, setCompanyFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchKeyword('');
    setLocationFilter('');
    setCompanyFilter('');
  }, [setSearchKeyword, setLocationFilter, setCompanyFilter]);

  // Handle job details modal
  const handleJobClick = useCallback((job: Doc<'jobListings'>) => {
    // Convert job listing to JobResult format for the modal
    const jobResult: JobResult = {
      jobListingId: job._id,
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
    setSelectedJob(jobResult);
    setIsInsightsOpen(true);
  }, []);

  const handleCloseInsights = useCallback(() => {
    setIsInsightsOpen(false);
    setSelectedJob(null);
  }, []);

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return t('job_results.date_format.unknown');
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('job_results.date_format.yesterday');
    if (diffDays < 7) return t('job_results.date_format.days_ago', { days: diffDays });
    if (diffDays < 30)
      return t('job_results.date_format.weeks_ago', { weeks: Math.floor(diffDays / 7) });
    return date.toLocaleDateString();
  };

  // This feature is only available for pro users
  if (!me?.isPro) {
    return (
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="bg-card/50 border-b px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
              {t('job_results.browse_jobs')}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('job_results.browse_subtitle')}
            </p>
          </div>
        </div>

        {/* Non-Pro Content */}
        <div className="px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="bg-card rounded-xl border p-8 text-center shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-3 text-2xl font-bold">
                  {t('job_results.non_pro.title')}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {t('job_results.non_pro.subtitle')}
                </p>
              </div>

              <div className="mb-8">
                <p className="text-muted-foreground mb-6 text-base">
                  {t('job_results.non_pro.description')}
                </p>

                {/* Features List */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-accent/10 rounded-lg p-4 text-left">
                    <h4 className="text-foreground mb-2 font-semibold">
                      {t('job_results.non_pro.features.searchable_jobs')}
                    </h4>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-left">
                    <h4 className="text-foreground mb-2 font-semibold">
                      {t('job_results.non_pro.features.regular_updates')}
                    </h4>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-left">
                    <h4 className="text-foreground mb-2 font-semibold">
                      {t('job_results.non_pro.features.advanced_filters')}
                    </h4>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-left">
                    <h4 className="text-foreground mb-2 font-semibold">
                      {t('job_results.non_pro.features.ai_matching')}
                    </h4>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-left md:col-span-2">
                    <h4 className="text-foreground mb-2 font-semibold">
                      {t('job_results.non_pro.features.save_jobs')}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => window.location.href = '/dashboard/upgrade'}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {t('job_results.non_pro.upgrade_button')}
                </Button>
                <Button
                  onClick={() => window.open('https://github.com/qaddam/qaddam', '_blank')}
                  variant="outline"
                  size="lg"
                >
                  {t('job_results.non_pro.learn_more')}
                </Button>
              </div>

              {/* Free Note */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-muted-foreground text-sm">
                  {t('job_results.non_pro.free_note')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card/50 border-b px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
            {t('job_results.browse_jobs')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('job_results.browse_subtitle')}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card/30 sticky top-0 z-10 border-b px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('job_results.search_placeholder')}
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="pr-4 pl-10"
            />
            {isSearching && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Location Filter */}
            <div className="relative flex-1">
              <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('job_results.location_placeholder')}
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="pr-4 pl-10"
              />
            </div>

            {/* Company Filter */}
            <div className="relative flex-1">
              <Building className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('job_results.company_placeholder')}
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="pr-4 pl-10"
              />
            </div>
          </div>

          {/* Company Quick Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                {t('job_results.popular_companies')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllCompanies(!showAllCompanies)}
                className="text-primary hover:text-primary/80"
              >
                {showAllCompanies ? t('job_results.show_less') : t('job_results.show_more')}
                <ChevronDown
                  className={`ml-1 h-3 w-3 transition-transform ${showAllCompanies ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {FAANG_COMPANIES.slice(0, showAllCompanies ? undefined : 5).map(company => (
                <Button
                  key={company}
                  variant={companyFilter === company ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCompanySelect(company)}
                  className="text-xs"
                >
                  {company}
                </Button>
              ))}
            </div>

            {/* Custom Company Input */}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder={t('job_results.custom_company_placeholder')}
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomCompanySubmit()}
                className="max-w-xs text-sm"
              />
              <Button
                onClick={handleCustomCompanySubmit}
                disabled={!customCompany.trim()}
                size="sm"
                variant="outline"
              >
                {t('job_results.add_company')}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-muted-foreground text-sm">
                {t('job_results.active_filters')}:
              </span>
              {debouncedSearch && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchKeyword('')}
                  className="h-6 px-2 text-xs"
                >
                  {debouncedSearch} ×
                </Button>
              )}
              {debouncedLocation && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLocationFilter('')}
                  className="h-6 px-2 text-xs"
                >
                  📍 {debouncedLocation} ×
                </Button>
              )}
              {debouncedCompany && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompanyFilter('')}
                  className="h-6 px-2 text-xs"
                >
                  🏢 {debouncedCompany} ×
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="ml-2 h-6 px-2 text-xs"
              >
                {t('job_results.clear_filters')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-6 py-6">
        <div className="mx-auto max-w-7xl">
          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  {t('job_results.loading.title')}
                </>
              ) : (
                t('job_results.showing_results', {
                  count: searchResults?.jobs?.length || 0,
                  total: searchResults?.totalCount || 0,
                })
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
                <span className="text-muted-foreground">{t('job_results.loading.subtitle')}</span>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && (!searchResults?.jobs || searchResults.jobs.length === 0) && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? t('job_results.errors.no_results')
                  : t('job_results.errors.no_jobs_available')}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters} variant="outline">
                  {t('job_results.clear_filters')}
                </Button>
              )}
            </div>
          )}

          {/* Job Listings - Clean Vertical Layout */}
          {!isLoading && searchResults?.jobs && searchResults.jobs.length > 0 && (
            <div className="space-y-4">
              {searchResults.jobs.map(job => (
                <div key={job._id} className="relative">
                  <div className="group border-border bg-card hover:border-primary/20 cursor-pointer rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors"
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerms(job.name, debouncedSearch),
                          }}
                        />
                        <div className="mb-3 flex items-center space-x-4 space-x-reverse">
                          <p
                            className="text-muted-foreground flex items-center text-base font-medium"
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerms(job.sourceName || '', debouncedSearch),
                            }}
                          />
                          {job.source && (
                            <span className="text-muted-foreground bg-accent/20 rounded px-2 py-1 text-sm">
                              {job.source}
                            </span>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                          {job.location && (
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <MapPin className="h-4 w-4" />
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightSearchTerms(job.location, debouncedLocation),
                                }}
                              />
                            </div>
                          )}

                          {job.salary && (
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {job.salary} {job.currency || ''}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(job.datePosted)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const isSaved = savedJobs.has(job._id);
                          handleSaveJob(job._id, isSaved);
                        }}
                        className={`rounded-full p-2 transition-colors ${
                          savedJobs.has(job._id)
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-accent/10 text-muted-foreground hover:bg-accent/20'
                        }`}
                        title={
                          savedJobs.has(job._id)
                            ? t('job_results.unsave_job')
                            : t('job_results.save_job')
                        }
                      >
                        <Heart
                          className={`h-5 w-5 ${savedJobs.has(job._id) ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Job Description Preview */}
                    {job.description && (
                      <div className="mb-4">
                        <p
                          className="text-muted-foreground line-clamp-2 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerms(
                              job.description.slice(0, 200) + '...',
                              debouncedSearch
                            ),
                          }}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/5"
                      >
                        {t('job_results.view_details')}
                      </Button>
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          window.open(job.sourceUrl || '', '_blank');
                        }}
                        disabled={!job.sourceUrl}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {t('job_results.apply_now')}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
