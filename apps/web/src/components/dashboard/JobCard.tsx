'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Clock, Briefcase, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { api } from '@qaddam/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { getJobTypeKey, getJobTypeColor, getMatchScoreColor } from '@/lib/enum-translations';
import LinkedIn from '@/components/logos/linkedin';
import Indeed from '@/components/logos/indeed';

interface JobCardProps {
  job: JobResult;
  onClick: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const t = useTranslations('dashboard');
  const [isSaved, setIsSaved] = useState(false);
  const jobListing = useQuery(api.job_data.getJobListing, {
    jobListingId: job.jobListingId,
  });

  const getJobTypeDisplay = () => {
    const jobType = job.extractedData?.jobType?.type || 'full_time';
    return {
      type: jobType,
      display: t(getJobTypeKey(jobType)),
      colorClass: getJobTypeColor(jobType),
    };
  };

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

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  if (!jobListing) {
    return (
      <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex h-48 items-center justify-center">
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
    );
  }

  return (
    <div
      onClick={onClick}
      className="group border-border bg-card hover:border-primary/20 cursor-pointer rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-foreground group-hover:text-primary mb-1 text-lg font-semibold transition-colors">
            {jobListing.name}
          </h3>
          <div className="mb-2 flex items-center space-x-2 space-x-reverse">
            <p className="text-muted-foreground text-sm font-medium">{jobListing.sourceName}</p>
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
          <div className="text-muted-foreground flex items-center space-x-2 space-x-reverse text-sm">
            <MapPin className="h-4 w-4" />
            <span>{jobListing.location}</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveJob}
          className={`rounded-full p-2 transition-colors ${
            isSaved
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-accent/10 text-muted-foreground hover:bg-accent/20'
          }`}
          title={t('job_results.save_job')}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getJobTypeDisplay().colorClass}`}
          >
            {getJobTypeDisplay().display}
          </span>
          <div className="text-muted-foreground flex items-center space-x-1 space-x-reverse text-xs">
            <Clock className="h-3 w-3" />
            <span>{formatDate(jobListing.datePosted)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Briefcase className="text-muted-foreground h-4 w-4" />
          <span className="text-foreground text-sm font-medium">
            {jobListing.salary
              ? `${jobListing.salary} ${jobListing.currency || ''}`
              : t('job_results.salary_not_specified')}
          </span>
        </div>
      </div>

      {/* Match Score */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            {t('job_results.match_score')}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${getMatchScoreColor(Math.round(job.experienceMatchScore * 100))}`}
          >
            {Math.round(job.experienceMatchScore * 100)}%
          </span>
        </div>
        <div className="bg-accent/10 h-1.5 w-full rounded-full">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(Math.round(job.experienceMatchScore * 100), 100)}%` }}
          />
        </div>
      </div>

      {/* Skills Preview */}
      {job.matchedSkills && job.matchedSkills.length > 0 && (
        <div className="mb-5">
          <div className="mb-2">
            <span className="text-muted-foreground text-xs font-medium">
              {t('job_results.matching_skills')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.matchedSkills.slice(0, 4).map((skill: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
              >
                {skill}
              </span>
            ))}
            {job.matchedSkills.length > 4 && (
              <span className="bg-accent/10 text-muted-foreground rounded-full px-2 py-1 text-xs">
                {t('job_results.skills.more_skills', { count: job.matchedSkills.length - 4 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Preview */}
      {job.aiMatchReasons && job.aiMatchReasons.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-green-700">
            {t('job_results.card_analysis.why_matches')}
          </div>
          <div className="rounded-lg bg-green-50/70 p-3 text-xs text-green-600">
            {job.aiMatchReasons[0]}
            {job.aiMatchReasons.length > 1 && (
              <span className="ml-2 text-green-500">
                {t('job_results.card_analysis.more_reasons', {
                  count: job.aiMatchReasons.length - 1,
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI Concerns Preview */}
      {job.aiConcerns && job.aiConcerns.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-yellow-700">
            {t('job_results.card_analysis.areas_to_consider')}
          </div>
          <div className="rounded-lg bg-yellow-50/70 p-3 text-xs text-yellow-600">
            {job.aiConcerns[0]}
            {job.aiConcerns.length > 1 && (
              <span className="ml-2 text-yellow-500">
                {t('job_results.card_analysis.more', { count: job.aiConcerns.length - 1 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description - Only show if available */}
      {jobListing.descriptionHtml && jobListing.descriptionHtml.trim() && (
        <div
          className="text-muted-foreground prose prose-sm mb-5 line-clamp-3 max-w-none text-xs"
          dangerouslySetInnerHTML={{
            __html: jobListing.descriptionHtml
              .replace(/<br>/g, '<br />')
              .replace(/<ul>/g, '<ul class="list-disc pl-4 my-2">')
              .replace(/<li>/g, '<li class="my-1">')
              .replace(/<strong>/g, '<strong class="font-semibold block mt-4 mb-2">'),
          }}
        />
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 flex-1 text-xs"
        >
          {t('job_results.view_details')}
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
        <Button
          onClick={() => window.open(jobListing.sourceUrl || '', '_blank')}
          disabled={!jobListing.sourceUrl}
          size="sm"
          variant="outline"
          className="border-primary/20 text-primary hover:bg-primary/5 h-8 flex-1 text-xs"
        >
          {t('job_results.apply_now')}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
