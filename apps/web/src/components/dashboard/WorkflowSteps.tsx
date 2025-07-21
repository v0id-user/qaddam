'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { FileText, Search, Target, Combine, CheckCircle, Clock, Circle, Info } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Step, StepStatus } from './types';
import { useLogger } from '@/lib/axiom/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';

interface WorkflowStepsProps {
  workflowId: string;
  workflowTrackingId: string;
  onComplete: () => void;
}

// Map workflow stages to UI steps with their percentage ranges
const STEP_STAGE_MAPPING = {
  aiParseCV: {
    stages: ['parsing_cv', 'cv_parsed', 'cv_parsing_error'],
    percentageRange: { min: 0, max: 20 },
  },
  aiTuneJobSearch: {
    stages: ['extracting_keywords', 'keywords_extracted', 'keyword_extraction_error'],
    percentageRange: { min: 20, max: 40 },
  },
  aiSearchJobs: {
    stages: ['searching_jobs', 'processing_jobs', 'jobs_processed'],
    percentageRange: { min: 40, max: 60 },
  },
  aiCombineJobResults: {
    stages: ['ranking_jobs', 'ai_analysis', 'extracting_data', 'jobs_ranked', 'no_jobs_found'],
    percentageRange: { min: 60, max: 80 },
  },
  aiSaveResults: {
    stages: ['saving_results', 'saving_job_results', 'completed', 'save_error'],
    percentageRange: { min: 80, max: 100 },
  },
};

const WorkflowSteps = ({ workflowId, workflowTrackingId, onComplete }: WorkflowStepsProps) => {
  const logger = useLogger();
  const t = useTranslations('dashboard');
  const [steps, setSteps] = useState<Step[]>([
    {
      key: 'aiParseCV',
      title: t('workflow.steps.parsing.title'),
      description: t('workflow.steps.parsing.description'),
      icon: <FileText className="h-6 w-6" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiTuneJobSearch',
      title: t('workflow.steps.tuning.title'),
      description: t('workflow.steps.tuning.description'),
      icon: <Target className="h-6 w-6" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiSearchJobs',
      title: t('workflow.steps.searching.title'),
      description: t('workflow.steps.searching.description'),
      icon: <Search className="h-6 w-6" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiCombineJobResults',
      title: t('workflow.steps.combining.title'),
      description: t('workflow.steps.combining.description'),
      icon: <Combine className="h-6 w-6" />,
      status: 'not_started',
      percentage: 0,
    },
    {
      key: 'aiSaveResults',
      title: t('workflow.steps.saving.title'),
      description: t('workflow.steps.saving.description'),
      icon: <CheckCircle className="h-6 w-6" />,
      status: 'not_started',
      percentage: 0,
    },
  ]);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Get workflow progress from the new workflow status system
  const workflowStatus = useQuery(api.workflow_status.getWorkflowStatus, {
    workflowTrackingId: workflowTrackingId,
    workflowId: workflowId,
  });

  // Calculate step status and percentage based on current workflow stage
  const calculateStepProgress = (
    stepKey: string,
    currentStage: string,
    currentPercentage: number
  ) => {
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

    logger.info('Workflow status update:', workflowStatus);

    const currentStage = workflowStatus.stage;
    const currentPercentage = workflowStatus.percentage;

    // Update step statuses and percentages based on workflow progress
    setSteps(prev =>
      prev.map(step => {
        const { status, percentage } = calculateStepProgress(
          step.key,
          currentStage,
          currentPercentage
        );
        return {
          ...step,
          status,
          percentage,
        };
      })
    );

    // Check if workflow is completed
    if (currentStage === 'completed' && currentPercentage === 100) {
      logger.info(
        'Workflow completed workflowId: ' +
          workflowId +
          ' workflowTrackingId: ' +
          workflowTrackingId
      );
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else if (currentStage.includes('error')) {
      logger.error('Workflow error:', { error: currentStage });
      // Handle error state - could show error message or retry option
    }
  }, [workflowStatus, workflowTrackingId, workflowId, onComplete, logger]);

  // Fake ETA timer logic
  useEffect(() => {
    if (workflowStatus?.stage === 'completed' || workflowStatus?.stage?.includes('error')) return;
    if (etaSeconds >= 180) return;
    const interval = setInterval(() => {
      setEtaSeconds(prev => {
        if (prev < 180) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [workflowStatus, etaSeconds]);

  // Show report dialog if timer exceeds 3 minutes and workflow not finished
  useEffect(() => {
    if (
      etaSeconds >= 180 &&
      workflowStatus?.stage !== 'completed' &&
      !workflowStatus?.stage?.includes('error')
    ) {
      setShowReportDialog(true);
    }
  }, [etaSeconds, workflowStatus]);

  useEffect(() => {
    if (workflowStatus?.status?.type === 'failed' || workflowStatus?.status?.type === 'canceled') {
      toast.error(t('workflow.error.title'));
      setShowReportDialog(true);
    }
  }, [workflowStatus, t]);

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'not_started':
        return <Circle className="text-muted-foreground h-5 w-5" />;
      case 'pending':
        return <Clock className="text-primary h-5 w-5 animate-pulse" />;
      case 'finished':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Circle className="text-muted-foreground h-5 w-5" />;
    }
  };

  const getStepClasses = (status: StepStatus) => {
    switch (status) {
      case 'not_started':
        return 'border-border bg-card/30';
      case 'pending':
        return 'border-primary/30 bg-primary/3 ring-1 ring-primary/10';
      case 'finished':
        return 'border-green-200 bg-green-50/50';
      default:
        return 'border-border bg-card/30';
    }
  };

  // Calculate overall progress percentage
  const overallProgress = workflowStatus?.percentage || 0;
  const completedSteps = steps.filter(step => step.status === 'finished').length;

  return (
    <div className="from-accent/20 via-background to-secondary/10 min-h-screen rounded-xl bg-gradient-to-br px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            {t('workflow.title')}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{t('workflow.subtitle')}</p>
          {workflowId && (
            <p className="text-muted-foreground mt-3 text-sm opacity-70">
              {t('workflow.workflow_id')} {workflowId}
            </p>
          )}
          {workflowStatus && (
            <p className="text-muted-foreground mt-1 text-sm opacity-70">
              Current Stage: {workflowStatus.stage} ({workflowStatus.percentage}%)
            </p>
          )}
          {/* ETA Timer */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-primary font-medium">{t('workflow.eta.label')}</span>
            <span className="text-muted-foreground text-sm">
              {t('workflow.eta.timer', {
                minutes: String(Math.floor(etaSeconds / 60)).padStart(2, '0'),
                seconds: String(etaSeconds % 60).padStart(2, '0'),
              })}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 cursor-pointer">
                  <Info className="text-muted-foreground h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('workflow.eta.tooltip')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-sm opacity-70">
              {t('workflow.status.not_started')}
            </span>
            <span className="text-muted-foreground text-sm opacity-70">
              {t('workflow.status.finished')}
            </span>
          </div>
          <div className="bg-accent/10 h-1.5 w-full rounded-full">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-primary text-sm font-medium">
              {overallProgress}% Complete ({completedSteps}/{steps.length} steps)
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map(step => (
            <div
              key={step.key}
              className={`rounded-xl border p-6 transition-all duration-500 ${getStepClasses(step.status)}`}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Step Icon */}
                <div
                  className={`rounded-full p-3 ${
                    step.status === 'pending'
                      ? 'bg-primary/8'
                      : step.status === 'finished'
                        ? 'bg-green-100/70'
                        : 'bg-accent/10'
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
                      <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                      {getStatusIcon(step.status)}
                    </div>
                    {step.status === 'pending' && (
                      <span className="text-primary text-sm font-medium">
                        {Math.round(step.percentage || 0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">{step.description}</p>

                  {/* Step Progress Bar */}
                  {step.status === 'pending' && (
                    <div className="mb-4">
                      <div className="bg-accent/10 h-1 w-full rounded-full">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${step.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {step.status === 'pending' && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full"
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
        {(workflowStatus?.status?.type === 'failed' ||
          workflowStatus?.status?.type === 'canceled' ||
          workflowStatus?.stage?.includes('error')) && (
          <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-red-100 p-2">
                <Circle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">{t('workflow.error.title')}</h3>
                <p className="text-sm text-red-700">
                  {t('workflow.error.stage_label')} {workflowStatus.stage}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('workflow.eta.report_dialog_title')}</DialogTitle>
              <DialogDescription>
                {t('workflow.eta.report_dialog_description', { workflowId })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  // TODO: Fill this handler to send report
                  setShowReportDialog(false);
                }}
              >
                {t('workflow.eta.report_dialog_confirm')}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">{t('workflow.eta.report_dialog_cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkflowSteps;
