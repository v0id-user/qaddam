'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle, AlertCircle, MapPin, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Job } from './types';

interface JobMatchInsightsProps {
  job: Job;
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('job_results.match_insights.title')}
              </h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <h3 className="text-lg font-semibold text-foreground">
                  {job.title}
                </h3>
                <span className="text-muted-foreground">@</span>
                <span className="text-muted-foreground">{job.company}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent/20 rounded-full transition-colors"
              title={t('job_results.match_insights.close')}
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Overall Match Score */}
          <div className="text-center p-6 bg-accent/10 rounded-2xl">
            <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                {t('job_results.match_score')}
              </h3>
            </div>
            <div className={`text-4xl font-bold mb-2 ${getMatchScoreColor(job.matchScore)}`}>
              {job.matchScore}%
            </div>
            <div className="w-full bg-accent/20 rounded-full h-3 mb-4">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${job.matchScore}%` }}
              />
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Matched Skills */}
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-800">
                  {t('job_results.match_insights.matched_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-yellow-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <h4 className="text-lg font-bold text-yellow-800">
                  {t('job_results.match_insights.missing_skills')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Match Details */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Experience Match */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-bold text-foreground">
                  {t('job_results.match_insights.experience_match')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {job.experienceMatch}
              </p>
            </div>

            {/* Salary Range */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-bold text-foreground">
                  {t('job_results.match_insights.salary_range')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {job.salary}
              </p>
            </div>

            {/* Location Match */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <MapPin className="h-6 w-6 text-purple-600" />
                <h4 className="text-lg font-bold text-foreground">
                  {t('job_results.match_insights.location_match')}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                {job.locationMatch}
              </p>
            </div>
          </div>

          {/* Job Requirements */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="text-lg font-bold text-foreground mb-4">
              Job Requirements
            </h4>
            <div className="space-y-2">
              {job.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-2 h-2 rounded-full ${
                    job.matchedSkills.includes(requirement) ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-muted-foreground text-sm">
                    {requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="text-lg font-bold text-foreground mb-4">
              Benefits & Perks
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="text-lg font-bold text-foreground mb-4">
              Job Description
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {job.description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 rounded-b-3xl">
          <div className="flex space-x-4 space-x-reverse">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {t('job_results.match_insights.close')}
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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