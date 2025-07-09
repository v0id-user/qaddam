'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { FileText, Search, Target, Combine, CheckCircle, Clock, Circle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Step, StepStatus } from './types';
import type { WorkflowId } from '@qaddam/backend/convex/jobs/workflow';

interface WorkflowStepsProps {
  workflowId: WorkflowId;
  onComplete: () => void;
}

const WorkflowSteps = ({ workflowId, onComplete }: WorkflowStepsProps) => {
  const t = useTranslations('dashboard');
  const [steps, setSteps] = useState<Step[]>([
    {
      key: 'aiParseCV',
      title: t('workflow.steps.parsing.title'),
      description: t('workflow.steps.parsing.description'),
      icon: <FileText className="h-8 w-8" />,
      status: 'not_started',
    },
    {
      key: 'aiTuneJobSearch',
      title: t('workflow.steps.tuning.title'),
      description: t('workflow.steps.tuning.description'),
      icon: <Target className="h-8 w-8" />,
      status: 'not_started',
    },
    {
      key: 'aiSearchJobs',
      title: t('workflow.steps.searching.title'),
      description: t('workflow.steps.searching.description'),
      icon: <Search className="h-8 w-8" />,
      status: 'not_started',
    },
    {
      key: 'aiCombineJobResults',
      title: t('workflow.steps.combining.title'),
      description: t('workflow.steps.combining.description'),
      icon: <Combine className="h-8 w-8" />,
      status: 'not_started',
    },
  ]);

  // Get workflow progress from Convex
  const workflowProgress = useQuery(api.jobs.data.getWorkflowStatus, { workflowId });

  // Update steps based on workflow progress
  useEffect(() => {
    if (!workflowProgress || !workflowId) return;

    console.log('Workflow progress update:', workflowProgress);

    // Update step statuses based on workflow progress
    setSteps(prev =>
      prev.map((step) => {
        const progressStep = workflowProgress.status === 'completed' ? 'finished' : 'not_started';
        if (progressStep) {
          return {
            ...step,
            status: progressStep,
          };
        }
        return step;
      })
    );

    // Check if workflow is completed
    if (workflowProgress.status === 'completed') {
      console.log('Workflow completed with results:', workflowProgress.result);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else if (workflowProgress.status === 'failed') {
      console.error('Workflow failed:', workflowProgress);
      // Handle error state
    }
  }, [workflowProgress, workflowId, onComplete]);

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

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.status === 'finished').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="from-accent/30 via-background to-secondary/20 min-h-screen bg-gradient-to-br px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            {t('workflow.title')}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">{t('workflow.subtitle')}</p>
          {workflowId && (
            <p className="text-muted-foreground mt-2 text-sm">Workflow ID: {workflowId}</p>
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
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-primary text-sm font-medium">
              {completedSteps} of {steps.length} steps completed
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
                  <div className="mb-2 flex items-center space-x-3 space-x-reverse">
                    <h3 className="text-foreground text-xl font-bold">{step.title}</h3>
                    {getStatusIcon(step.status)}
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                  {step.status === 'pending' && (
                    <div className="mt-3 flex items-center space-x-2 space-x-reverse">
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
        {workflowProgress?.status === 'failed' && (
          <div className="mt-8 rounded-2xl border-2 border-red-500 bg-red-50 p-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-red-100 p-2">
                <Circle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">Workflow Error</h3>
                <p className="text-red-700">{workflowProgress.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSteps;
