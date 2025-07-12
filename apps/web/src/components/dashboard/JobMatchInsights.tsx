'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle, AlertCircle, MapPin, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';

interface JobMatchInsightsProps {
  job: JobResult;
  onClose: () => void;
}

const JobMatchInsights = ({ job, onClose }: JobMatchInsightsProps) => {
  const t = useTranslations('dashboard');

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

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
        <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl shadow-2xl">
          <div className="flex h-96 items-center justify-center">
            <div className="space-y-4">
              <div className="bg-accent rounded-full p-6">
                <div className="border-primary h-14 w-14 animate-spin rounded-full border-t-2 border-b-2"></div>
              </div>
              <div className="space-y-2">
                <p className="text-foreground text-xl font-semibold">
                  {t('job_results.loading.title')}
                </p>
                <p className="text-muted-foreground text-base">
                  {t('job_results.loading.subtitle')}
                </p>
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
      <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="bg-card border-border sticky top-0 rounded-t-3xl border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-foreground mb-2 text-2xl font-bold">
                {t('job_results.match_insights.title')}
              </h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <h3 className="text-foreground text-lg font-semibold">{jobListing.name}</h3>
                <span className="text-muted-foreground">@</span>
                <span className="text-muted-foreground">{jobListing.sourceName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-accent/20 rounded-full p-2 transition-colors"
              title={t('job_results.match_insights.close')}
            >
              <X className="text-muted-foreground h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 p-6">
          {/* Overall Match Score */}
          <div className="bg-accent/10 rounded-2xl p-6 text-center">
            <div className="mb-4 flex items-center justify-center space-x-3 space-x-reverse">
              <TrendingUp className="text-primary h-8 w-8" />
              <h3 className="text-foreground text-xl font-bold">{t('job_results.match_score')}</h3>
            </div>
            <div className={`mb-2 text-4xl font-bold ${getMatchScoreColor(Math.round(job.experienceMatchScore * 100))}`}>
              {Math.round(job.experienceMatchScore * 100)}%
            </div>
            <div className="bg-accent/20 mb-4 h-3 w-full rounded-full">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.round(job.experienceMatchScore * 100), 100)}%` }}
              />
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Matched Skills */}
            <div className="rounded-2xl bg-green-50 p-6">
              <div className="mb-4 flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-800">
                  {t('job_results.match_insights.matched_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-2xl bg-yellow-50 p-6">
              <div className="mb-4 flex items-center space-x-3 space-x-reverse">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <h4 className="text-lg font-bold text-yellow-800">
                  {t('job_results.match_insights.missing_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Match Analysis Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Experience Match Reasons */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <Clock className="h-6 w-6 text-blue-600" />
                <h4 className="text-foreground text-lg font-bold">
                  {t('job_results.match_insights.experience_match')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{job.experienceMatch}</p>
              {job.experienceMatchReasons && job.experienceMatchReasons.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-foreground font-semibold text-sm">{t('job_results.match_insights.why_matches')}</h5>
                  <ul className="space-y-1">
                    {job.experienceMatchReasons.map((reason, index) => (
                      <li key={index} className="text-muted-foreground text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Location Match */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-6 w-6 text-purple-600" />
                <h4 className="text-foreground text-lg font-bold">
                  {t('job_results.match_insights.location_match')} ({Math.round(job.locationMatchScore * 100)}%)
                </h4>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{jobListing.location}</p>
              {job.locationMatchReasons && job.locationMatchReasons.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-foreground font-semibold text-sm">{t('job_results.match_insights.location_analysis')}</h5>
                  <ul className="space-y-1">
                    {job.locationMatchReasons.map((reason, index) => (
                      <li key={index} className="text-muted-foreground text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Additional Match Details */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* AI Recommendation */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h4 className="text-foreground text-lg font-bold">
                  {t('job_results.match_insights.ai_recommendation')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm capitalize">
                {job.aiRecommendation?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>

            {/* Salary Range */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h4 className="text-foreground text-lg font-bold">
                  {t('job_results.match_insights.salary_range')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {jobListing.salary ? `${jobListing.salary} ${jobListing.currency || ''}` : t('job_results.salary_not_specified')}
              </p>
            </div>

            {/* Work Type Match */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <div className="mb-3 flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-6 w-6 text-orange-600" />
                <h4 className="text-foreground text-lg font-bold">
                  {t('job_results.match_insights.work_type_match')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {job.workTypeMatch ? t('job_results.match_insights.matches_preference') : t('job_results.match_insights.may_not_match_preference')}
              </p>
            </div>
          </div>

          {/* AI Analysis Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI Match Reasons */}
            {job.aiMatchReasons && job.aiMatchReasons.length > 0 && (
              <div className="bg-green-50 border-green-200 rounded-2xl border p-6">
                <h4 className="text-green-800 mb-4 text-lg font-bold flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {t('job_results.match_insights.ai_match_analysis')}
                </h4>
                <div className="space-y-2">
                  {job.aiMatchReasons.map((reason, index) => (
                    <div key={index} className="text-green-700 text-sm flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Concerns */}
            {job.aiConcerns && job.aiConcerns.length > 0 && (
              <div className="bg-yellow-50 border-yellow-200 rounded-2xl border p-6">
                <h4 className="text-yellow-800 mb-4 text-lg font-bold flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {t('job_results.match_insights.areas_to_consider')}
                </h4>
                <div className="space-y-2">
                  {job.aiConcerns.map((concern, index) => (
                    <div key={index} className="text-yellow-700 text-sm flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Requirements */}
          <div className="bg-card border-border rounded-2xl border p-6">
            <h4 className="text-foreground mb-4 text-lg font-bold">
              {t('job_results.job_details.requirements')}
            </h4>
            <div className="space-y-2">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground text-sm">{t('job_results.messages.placeholder_requirement', { index: index + 1 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-card border-border rounded-2xl border p-6">
            <h4 className="text-foreground mb-4 text-lg font-bold">
              {t('job_results.job_details.benefits')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-card border-border rounded-2xl border p-6">
            <h4 className="text-foreground mb-4 text-lg font-bold">
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
        <div className="bg-card border-border sticky bottom-0 rounded-b-3xl border-t p-6">
          <div className="flex space-x-4 space-x-reverse">
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
