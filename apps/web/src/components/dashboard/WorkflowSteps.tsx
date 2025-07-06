'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { FileText, Search, Target, Combine, CheckCircle, Clock, Circle } from 'lucide-react';

type StepStatus = 'not_started' | 'pending' | 'finished';

interface Step {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
}

interface WorkflowStepsProps {
  onComplete: () => void;
}

const WorkflowSteps = ({ onComplete }: WorkflowStepsProps) => {
  const t = useTranslations('dashboard');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    {
      key: 'parsing',
      title: t('workflow.steps.parsing.title'),
      description: t('workflow.steps.parsing.description'),
      icon: <FileText className="h-8 w-8" />,
      status: 'not_started'
    },
    {
      key: 'tuning',
      title: t('workflow.steps.tuning.title'),
      description: t('workflow.steps.tuning.description'),
      icon: <Target className="h-8 w-8" />,
      status: 'not_started'
    },
    {
      key: 'searching',
      title: t('workflow.steps.searching.title'),
      description: t('workflow.steps.searching.description'),
      icon: <Search className="h-8 w-8" />,
      status: 'not_started'
    },
    {
      key: 'combining',
      title: t('workflow.steps.combining.title'),
      description: t('workflow.steps.combining.description'),
      icon: <Combine className="h-8 w-8" />,
      status: 'not_started'
    }
  ]);

  // Simulate workflow progress
  useEffect(() => {
    const processStep = (stepIndex: number) => {
      // Mark current step as pending
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex ? { ...step, status: 'pending' as StepStatus } : step
      ));

      // After 2 seconds, mark as finished and move to next
      setTimeout(() => {
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex ? { ...step, status: 'finished' as StepStatus } : step
        ));

        if (stepIndex < steps.length - 1) {
          setCurrentStep(stepIndex + 1);
        } else {
          // All steps completed
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }, 2000);
    };

    if (currentStep < steps.length) {
      processStep(currentStep);
    }
  }, [currentStep, steps.length, onComplete]);

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'not_started':
        return <Circle className="h-6 w-6 text-muted-foreground" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-primary animate-pulse" />;
      case 'finished':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-secondary/20 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            {t('workflow.title')}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            {t('workflow.subtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {t('workflow.status.not_started')}
            </span>
            <span className="text-sm text-muted-foreground">
              {t('workflow.status.finished')}
            </span>
          </div>
          <div className="w-full bg-accent/20 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`rounded-2xl border-2 p-8 transition-all duration-500 ${getStepClasses(step.status)}`}
            >
              <div className="flex items-center space-x-6 space-x-reverse">
                {/* Step Icon */}
                <div className={`rounded-full p-4 ${
                  step.status === 'pending' ? 'bg-primary/10' :
                  step.status === 'finished' ? 'bg-green-100' :
                  'bg-accent/20'
                }`}>
                  <div className={`${
                    step.status === 'pending' ? 'text-primary' :
                    step.status === 'finished' ? 'text-green-600' :
                    'text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <h3 className="text-foreground text-xl font-bold">
                      {step.title}
                    </h3>
                    {getStatusIcon(step.status)}
                  </div>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                  {step.status === 'pending' && (
                    <div className="mt-3 flex items-center space-x-2 space-x-reverse">
                      <div className="flex space-x-1 space-x-reverse">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-primary font-medium">
                        {t('workflow.status.pending')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSteps; 