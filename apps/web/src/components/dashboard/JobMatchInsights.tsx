'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle, AlertCircle, MapPin, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import {
  getExperienceMatchKey,
  getAIRecommendationKey,
  getMatchScoreColor,
} from '@/lib/enum-translations';
import LinkedIn from '@/components/logos/linkedin';
import Indeed from '@/components/logos/indeed';

interface JobMatchInsightsProps {
  job: JobResult;
  onClose: () => void;
}

const JobMatchInsights = ({ job, onClose }: JobMatchInsightsProps) => {
  const t = useTranslations('dashboard');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const jobListing = useQuery(api.job_data.getJobListing, {
    jobListingId: job.jobListingId,
  });

  if (!jobListing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl shadow-2xl">
          <div className="flex h-80 items-center justify-center">
            <div className="space-y-3">
              <div className="bg-accent/50 rounded-full p-4">
                <div className="border-primary h-10 w-10 animate-spin rounded-full border-t-2 border-b-2"></div>
              </div>
              <div className="space-y-2">
                <p className="text-foreground text-lg font-medium">
                  {t('job_results.loading.title')}
                </p>
                <p className="text-muted-foreground text-sm">{t('job_results.loading.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-card border-border sticky top-0 rounded-t-2xl border-b p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-foreground mb-2 text-xl font-bold">
                {t('job_results.match_insights.title')}
              </h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <h3 className="text-foreground text-lg font-semibold">{jobListing.name}</h3>
                <span className="text-muted-foreground">@</span>
                <span className="text-muted-foreground">{jobListing.sourceName}</span>
                {jobListing.source && (
                  <div className="flex items-center">
                    {jobListing.source === 'linkedIn' ? (
                      <LinkedIn className="h-4 w-4" />
                    ) : jobListing.source === 'indeed' ? (
                      <Indeed className="h-4 w-4" />
                    ) : (
                      <span className="text-muted-foreground text-xs">{jobListing.source}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-accent/20 rounded-full p-2 transition-colors"
              title={t('job_results.match_insights.close')}
            >
              <X className="text-muted-foreground h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-5">
          {/* Overall Match Score */}
          <div className="bg-accent/5 rounded-xl p-5 text-center">
            <div className="mb-3 flex items-center justify-center space-x-3 space-x-reverse">
              <TrendingUp className="text-primary h-6 w-6" />
              <h3 className="text-foreground text-lg font-semibold">
                {t('job_results.match_score')}
              </h3>
            </div>
            <div
              className={`mb-2 text-3xl font-bold ${getMatchScoreColor(Math.round(job.experienceMatchScore * 100))}`}
            >
              {Math.round(job.experienceMatchScore * 100)}%
            </div>
            <div className="bg-accent/10 mb-3 h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.round(job.experienceMatchScore * 100), 100)}%` }}
              />
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Matched Skills */}
            <div className="rounded-xl bg-green-50/70 p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800">
                  {t('job_results.match_insights.matched_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-xl bg-yellow-50/70 p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="text-lg font-semibold text-yellow-800">
                  {t('job_results.match_insights.missing_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Match Analysis Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Experience Match Reasons */}
            <div className="bg-card border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <Clock className="h-5 w-5 text-blue-600" />
                <h4 className="text-foreground text-lg font-semibold">
                  {t('job_results.match_insights.experience_match')}
                </h4>
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                {t(getExperienceMatchKey(job.experienceMatch))}
              </p>
              {job.experienceMatchReasons && job.experienceMatchReasons.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-foreground text-sm font-medium">
                    {t('job_results.match_insights.why_matches')}
                  </h5>
                  <ul className="space-y-1">
                    {job.experienceMatchReasons.map((reason, index) => (
                      <li key={index} className="text-muted-foreground flex items-start text-xs">
                        <span className="mr-2 text-green-500">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Location Match */}
            <div className="bg-card border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-purple-600" />
                <h4 className="text-foreground text-lg font-semibold">
                  {t('job_results.match_insights.location_match')} (
                  {Math.round(job.locationMatchScore * 100)}%)
                </h4>
              </div>
              <p className="text-muted-foreground mb-3 text-sm">{jobListing.location}</p>
              {job.locationMatchReasons && job.locationMatchReasons.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-foreground text-sm font-medium">
                    {t('job_results.match_insights.location_analysis')}
                  </h5>
                  <ul className="space-y-1">
                    {job.locationMatchReasons.map((reason, index) => (
                      <li key={index} className="text-muted-foreground flex items-start text-xs">
                        <span className="mr-2 text-blue-500">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Additional Match Details */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* AI Recommendation */}
            <div className="bg-card border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="text-foreground text-lg font-semibold">
                  {t('job_results.match_insights.ai_recommendation')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm capitalize">
                {t(getAIRecommendationKey(job.aiRecommendation || 'consider'))}
              </p>
            </div>

            {/* Salary Range */}
            <div className="bg-card border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="text-foreground text-lg font-semibold">
                  {t('job_results.match_insights.salary_range')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {jobListing.salary
                  ? `${jobListing.salary} ${jobListing.currency || ''}`
                  : t('job_results.salary_not_specified')}
              </p>
            </div>

            {/* Work Type Match */}
            <div className="bg-card border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <h4 className="text-foreground text-lg font-semibold">
                  {t('job_results.match_insights.work_type_match')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {job.workTypeMatch
                  ? t('job_results.match_insights.matches_preference')
                  : t('job_results.match_insights.may_not_match_preference')}
              </p>
            </div>
          </div>

          {/* AI Analysis Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* AI Match Reasons */}
            {job.aiMatchReasons && job.aiMatchReasons.length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <h4 className="mb-3 flex items-center text-lg font-semibold text-blue-800">
                  <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                  {t('job_results.match_insights.ai_match_analysis')}
                </h4>
                <div className="space-y-2">
                  {job.aiMatchReasons.map((reason, index) => (
                    <div key={index} className="flex items-start text-xs text-blue-700">
                      <span className="mr-2 text-blue-500">•</span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Concerns */}
            {job.aiConcerns && job.aiConcerns.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">
                <h4 className="mb-3 flex items-center text-lg font-semibold text-orange-800">
                  <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                  {t('job_results.match_insights.areas_to_consider')}
                </h4>
                <div className="space-y-2">
                  {job.aiConcerns.map((concern, index) => (
                    <div key={index} className="flex items-start text-xs text-orange-700">
                      <span className="mr-2 text-orange-500">•</span>
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Requirements */}
          <div className="bg-card border-border rounded-xl border p-4">
            <h4 className="text-foreground mb-3 text-lg font-semibold">
              {t('job_results.job_details.requirements')}
            </h4>
            <div className="space-y-2">
              {job.requirements && job.requirements.length > 0 ? (
                job.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3 space-x-reverse">
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                    <span className="text-muted-foreground text-sm">{requirement}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground text-sm italic">
                    No specific requirements mentioned in job description
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-card border-border rounded-xl border p-4">
            <h4 className="text-foreground mb-3 text-lg font-semibold">
              {t('job_results.job_details.benefits')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="bg-primary/8 text-primary rounded-full px-3 py-1 text-xs font-medium"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-card border-border rounded-xl border p-4">
            <h4 className="text-foreground mb-3 text-lg font-semibold">
              {t('job_results.job_details.description')}
            </h4>
            <div
              className="text-muted-foreground prose prose-sm max-w-none text-sm leading-relaxed"
              dir="auto"
              dangerouslySetInnerHTML={{
                __html: jobListing.descriptionHtml
                  .replace(/<br>/g, '<br />')
                  .replace(/<ul>/g, '<ul class="list-disc pl-4 my-2">')
                  .replace(/<li>/g, '<li class="my-1">')
                  .replace(/<strong>/g, '<strong class="font-semibold block mt-4 mb-2">'),
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-card border-border sticky bottom-0 rounded-b-2xl border-t p-5">
          <div className="flex gap-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              {t('job_results.match_insights.close')}
            </Button>
            <Button
              onClick={() => window.open(jobListing.sourceUrl || '', '_blank')}
              disabled={!jobListing.sourceUrl}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
            >
              {t('job_results.apply_now')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMatchInsights;
