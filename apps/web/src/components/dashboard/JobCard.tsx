'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Clock, Briefcase, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { JobResult } from './types';

interface JobCardProps {
  job: JobResult;
  onClick: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const t = useTranslations('dashboard');
  const [isSaved, setIsSaved] = useState(false);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-green-100 text-green-800';
      case 'part_time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'remote':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <div
      onClick={onClick}
      className="group border-border bg-card hover:border-primary/40 cursor-pointer rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
            {job.title}
          </h3>
          <p className="text-muted-foreground mb-2 font-medium">{job.company}</p>
          <div className="text-muted-foreground flex items-center space-x-2 space-x-reverse text-sm">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
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
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(job.type)}`}>
            {t(`job_results.job_types.${job.type}`)}
          </span>
          <div className="text-muted-foreground flex items-center space-x-1 space-x-reverse text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Briefcase className="text-muted-foreground h-4 w-4" />
          <span className="text-foreground font-medium">{job.salary || t('job_results.salary_not_specified')}</span>
        </div>
      </div>

      {/* Match Score */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {t('job_results.match_score')}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-sm font-bold ${getMatchScoreColor(job.matchScore)}`}
          >
            {job.matchScore}%
          </span>
        </div>
        <div className="bg-accent/20 h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      </div>

      {/* Skills Preview */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {job.matchedSkills.slice(0, 3).map((skill, index) => (
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

      {/* Description */}
      <p className="text-muted-foreground mb-6 line-clamp-3 text-sm">{job.description}</p>

      {/* Actions */}
      <div className="flex space-x-3 space-x-reverse">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
          {t('job_results.view_details')}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <Button
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
