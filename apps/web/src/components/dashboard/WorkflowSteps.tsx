'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { FileText, Search, Target, Combine, CheckCircle, Clock, Circle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Step, StepStatus } from './types';

interface WorkflowStepsProps {
  workflowId: string;
  workflowTrackingId: string;
  onComplete: () => void;
}

// Map workflow stages to UI steps with their percentage ranges
const STEP_STAGE_MAPPING = {
  'aiParseCV': {
    stages: ['parsing_cv', 'cv_parsed', 'cv_parsing_error'],
    percentageRange: { min: 0, max: 20 }
  },
  'aiTuneJobSearch': {
    stages: ['extracting_keywords', 'keywords_extracted', 'keyword_extraction_error'],
    percentageRange: { min: 20, max: 40 }
  },
  'aiSearchJobs': {
    stages: ['searching_jobs', 'processing_jobs', 'jobs_processed'],
    percentageRange: { min: 40, max: 60 }
  },
  'aiCombineJobResults': {
    stages: ['ranking_jobs', 'ai_analysis', 'extracting_data', 'jobs_ranked', 'no_jobs_found'],
    percentageRange: { min: 60, max: 80 }
  },
  'aiSaveResults': {
    stages: ['saving_results', 'saving_job_results', 'completed', 'save_error'],
    percentageRange: { min: 80, max: 100 }
  }
};

const WorkflowSteps = ({ workflowId, workflowTrackingId, onComplete }: WorkflowStepsProps) => {
  const t = useTranslations('dashboard');
  const [steps, setSteps] = useState<Step[]>([
    {
      key: 'aiParseCV',
      title: t('workflow.steps.parsing.title'),
      description: t('workflow.steps.parsing.description'),
      icon: <FileText className="h-8 w-8" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiTuneJobSearch',
      title: t('workflow.steps.tuning.title'),
      description: t('workflow.steps.tuning.description'),
      icon: <Target className="h-8 w-8" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiSearchJobs',
      title: t('workflow.steps.searching.title'),
      description: t('workflow.steps.searching.description'),
      icon: <Search className="h-8 w-8" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiCombineJobResults',
      title: t('workflow.steps.combining.title'),
      description: t('workflow.steps.combining.description'),
      icon: <Combine className="h-8 w-8" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiSaveResults',
      title: t('workflow.steps.saving.title'),
      description: t('workflow.steps.saving.description'),
      icon: <CheckCircle className="h-8 w-8" />,
      status: 'not_started',
      percentage: 0,
    },
  ]);

  // Get workflow progress from the new workflow status system
  const workflowStatus = useQuery(api.workflow_status.getWorkflowStatus, { workflowTrackingId: workflowTrackingId });

  // Calculate step status and percentage based on current workflow stage
  const calculateStepProgress = (stepKey: string, currentStage: string, currentPercentage: number) => {
    const stepMapping = STEP_STAGE_MAPPING[stepKey as keyof typeof STEP_STAGE_MAPPING];
    if (!stepMapping) return { status: 'not_started' as StepStatus, percentage: 0 };

    const { stages, percentageRange } = stepMapping;
    const isStageActive = stages.includes(currentStage);
    const isStageCompleted = currentPercentage > percentageRange.max;
    const isStageStarted = currentPercentage >= percentageRange.min;

    // Calculate individual step percentage (0-100 within the step's range)
    let stepPercentage = 0;
    if (isStageCompleted) {
      stepPercentage = 100;
    } else if (isStageActive || isStageStarted) {
      const relativeProgress = currentPercentage - percentageRange.min;
      const rangeSize = percentageRange.max - percentageRange.min;
      stepPercentage = Math.min(100, Math.max(0, (relativeProgress / rangeSize) * 100));
    }

    // Determine step status
    let status: StepStatus = 'not_started';
    if (isStageCompleted) {
      status = 'finished';
    } else if (isStageActive || isStageStarted) {
      status = 'pending';
    }

    // Handle error states
    if (currentStage.includes('error')) {
      status = 'not_started'; // Reset to not_started on error
      stepPercentage = 0;
    }

    return { status, percentage: stepPercentage };
  };

  // Update steps based on workflow status
  useEffect(() => {
    if (!workflowStatus || !workflowId) return;

    console.log('Workflow status update:', workflowStatus);

    const currentStage = workflowStatus.stage;
    const currentPercentage = workflowStatus.percentage;

    // Update step statuses and percentages based on workflow progress
    setSteps(prev =>
      prev.map(step => {
        const { status, percentage } = calculateStepProgress(step.key, currentStage, currentPercentage);
        return {
          ...step,
          status,
          percentage,
        };
      })
    );

    // Check if workflow is completed
    if (currentStage === 'completed' && currentPercentage === 100) {
      console.log('Workflow completed');
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else if (currentStage.includes('error')) {
      console.error('Workflow error:', currentStage);
      // Handle error state - could show error message or retry option
    }
  }, [workflowStatus, workflowId, onComplete]);

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'not_started':
        return <Circle className="text-muted-foreground h-6 w-6" />;
      case 'pending':
        return <Clock className="text-primary h-6 w-6 animate-pulse" />;
      case 'finished':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Circle className="text-muted-foreground h-6 w-6" />;
    }
  };

  const getStepClasses = (status: StepStatus) => {
    switch (status) {
      case 'not_started':
        return 'border-border bg-card/50';
      case 'pending':
        return 'border-primary bg-primary/5 ring-2 ring-primary/20';
      case 'finished':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-border bg-card/50';
    }
  };

  // Calculate overall progress percentage
  const overallProgress = workflowStatus?.percentage || 0;
  const completedSteps = steps.filter(step => step.status === 'finished').length;

  return (
    <div className="from-accent/30 via-background to-secondary/20 min-h-screen rounded-xl bg-gradient-to-br px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            {t('workflow.title')}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">{t('workflow.subtitle')}</p>
          {workflowId && (
            <p className="text-muted-foreground mt-2 text-sm">{t('workflow.workflow_id')} {workflowId}</p>
          )}
          {workflowStatus && (
            <p className="text-muted-foreground mt-1 text-sm">
              Current Stage: {workflowStatus.stage} ({workflowStatus.percentage}%)
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('workflow.status.not_started')}
            </span>
            <span className="text-muted-foreground text-sm">{t('workflow.status.finished')}</span>
          </div>
          <div className="bg-accent/20 h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-primary text-sm font-medium">
              {overallProgress}% Complete ({completedSteps}/{steps.length} steps)
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map(step => (
            <div
              key={step.key}
              className={`rounded-2xl border-2 p-8 transition-all duration-500 ${getStepClasses(step.status)}`}
            >
              <div className="flex items-center space-x-6 space-x-reverse">
                {/* Step Icon */}
                <div
                  className={`rounded-full p-4 ${
                    step.status === 'pending'
                      ? 'bg-primary/10'
                      : step.status === 'finished'
                        ? 'bg-green-100'
                        : 'bg-accent/20'
                  }`}
                >
                  <div
                    className={`${
                      step.status === 'pending'
                        ? 'text-primary'
                        : step.status === 'finished'
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h3 className="text-foreground text-xl font-bold">{step.title}</h3>
                      {getStatusIcon(step.status)}
                    </div>
                    {step.status === 'pending' && (
                      <span className="text-primary text-sm font-medium">
                        {Math.round(step.percentage || 0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  
                  {/* Step Progress Bar */}
                  {step.status === 'pending' && (
                    <div className="mb-3">
                      <div className="bg-accent/20 h-1.5 w-full rounded-full">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${step.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {step.status === 'pending' && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="flex space-x-1 space-x-reverse">
                        <div
                          className="bg-primary h-2 w-2 animate-bounce rounded-full"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="bg-primary h-2 w-2 animate-bounce rounded-full"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="bg-primary h-2 w-2 animate-bounce rounded-full"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                      <span className="text-primary text-sm font-medium">
                        {t('workflow.status.pending')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error State */}
        {workflowStatus?.stage.includes('error') && (
          <div className="mt-8 rounded-2xl border-2 border-red-500 bg-red-50 p-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-red-100 p-2">
                <Circle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">{t('workflow.error.title')}</h3>
                <p className="text-red-700">Stage: {workflowStatus.stage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSteps;
