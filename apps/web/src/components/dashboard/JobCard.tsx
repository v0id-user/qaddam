'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Clock, Briefcase, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { JobResult } from '@qaddam/backend/convex/types/jobs';
import { api } from '@qaddam/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { 
  getJobTypeKey, 
  getJobTypeColor, 
  getMatchScoreColor 
} from '@/lib/enum-translations';

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

  const getJobTypeDisplay = (extractedData: any) => {
    const jobType = extractedData?.jobType?.type || 'full_time';
    return {
      type: jobType,
      display: t(getJobTypeKey(jobType)),
      colorClass: getJobTypeColor(jobType)
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
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex h-64 items-center justify-center">
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
    );
  }

  return (
    <div
      onClick={onClick}
      className="group border-border bg-card hover:border-primary/40 cursor-pointer rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
            {jobListing.name}
          </h3>
          <p className="text-muted-foreground mb-2 font-medium">{jobListing.sourceName}</p>
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
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-accent/20 text-muted-foreground hover:bg-accent/30'
          }`}
          title={t('job_results.save_job')}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getJobTypeDisplay(job.extractedData).colorClass}`}
          >
            {getJobTypeDisplay(job.extractedData).display}
          </span>
          <div className="text-muted-foreground flex items-center space-x-1 space-x-reverse text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatDate(jobListing.datePosted)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Briefcase className="text-muted-foreground h-4 w-4" />
          <span className="text-foreground font-medium">
            {jobListing.salary ? `${jobListing.salary} ${jobListing.currency || ''}` : t('job_results.salary_not_specified')}
          </span>
        </div>
      </div>

      {/* Match Score */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {t('job_results.match_score')}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-sm font-bold ${getMatchScoreColor(Math.round(job.experienceMatchScore * 100))}`}
          >
            {Math.round(job.experienceMatchScore * 100)}%
          </span>
        </div>
        <div className="bg-accent/20 h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(Math.round(job.experienceMatchScore * 100), 100)}%` }}
          />
        </div>
      </div>

      {/* Skills Preview */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {job.matchedSkills.slice(0, 3).map((skill: string, index: number) => (
            <span
              key={index}
              className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
            >
              {skill}
            </span>
          ))}
          {job.matchedSkills.length > 3 && (
            <span className="bg-accent/20 text-muted-foreground rounded-full px-2 py-1 text-xs font-medium">
              {t('job_results.skills.more_skills', { count: job.matchedSkills.length - 3 })}
            </span>
          )}
        </div>
      </div>

      {/* AI Analysis Preview */}
      {job.aiMatchReasons && job.aiMatchReasons.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-green-700 mb-2">
            {t('job_results.card_analysis.why_matches')}
          </div>
          <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
            {job.aiMatchReasons[0]}
            {job.aiMatchReasons.length > 1 && (
              <span className="text-green-500 ml-2">
                {t('job_results.card_analysis.more_reasons', { count: job.aiMatchReasons.length - 1 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI Concerns Preview */}
      {job.aiConcerns && job.aiConcerns.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-yellow-700 mb-2">
            {t('job_results.card_analysis.areas_to_consider')}
          </div>
          <div className="text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3">
            {job.aiConcerns[0]}
            {job.aiConcerns.length > 1 && (
              <span className="text-yellow-500 ml-2">
                {t('job_results.card_analysis.more', { count: job.aiConcerns.length - 1 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div
        className="text-muted-foreground prose prose-sm mb-6 line-clamp-3 max-w-none text-sm"
        dangerouslySetInnerHTML={{
          __html: jobListing.descriptionHtml
            .replace(/<br>/g, '<br />')
            .replace(/<ul>/g, '<ul class="list-disc pl-4 my-2">')
            .replace(/<li>/g, '<li class="my-1">')
            .replace(/<strong>/g, '<strong class="font-semibold block mt-4 mb-2">'),
        }}
      />

      {/* Actions */}
      <div className="flex space-x-3 space-x-reverse">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
          {t('job_results.view_details')}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => window.open(jobListing.sourceUrl || '', '_blank')}
          disabled={!jobListing.sourceUrl}
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5 flex-1"
        >
          {t('job_results.apply_now')}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
