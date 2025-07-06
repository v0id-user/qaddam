'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Clock, Briefcase, TrendingUp, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Job } from './types';

interface JobCardProps {
  job: Job;
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
    if (diffDays < 30) return t('job_results.date_format.weeks_ago', { weeks: Math.floor(diffDays / 7) });
    return date.toLocaleDateString();
  };

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-foreground font-bold text-xl mb-1 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-muted-foreground font-medium mb-2">
            {job.company}
          </p>
          <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSaveJob}
          className={`p-2 rounded-full transition-colors ${
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
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
            {t(`job_results.job_types.${job.type}`)}
          </span>
          <div className="flex items-center space-x-1 space-x-reverse text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{job.salary}</span>
        </div>
      </div>

      {/* Match Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('job_results.match_score')}
          </span>
          <span className={`px-2 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(job.matchScore)}`}>
            {job.matchScore}%
          </span>
        </div>
        <div className="w-full bg-accent/20 rounded-full h-2">
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
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
          {job.matchedSkills.length > 3 && (
            <span className="px-2 py-1 bg-accent/20 text-muted-foreground text-xs rounded-full font-medium">
              {t('job_results.skills.more_skills', { count: job.matchedSkills.length - 3 })}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
        {job.description}
      </p>

      {/* Actions */}
      <div className="flex space-x-3 space-x-reverse">
        <Button
          size="sm"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t('job_results.view_details')}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-primary text-primary hover:bg-primary/5"
        >
          {t('job_results.apply_now')}
        </Button>
      </div>


    </div>
  );
};

export default JobCard; 