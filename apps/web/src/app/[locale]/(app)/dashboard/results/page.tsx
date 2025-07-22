'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import JobResults from '@/components/dashboard/JobResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { WorkflowId } from '@qaddam/backend/convex/jobs/workflow';

function ResultsContent() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const t = useTranslations('dashboard');

  if (!workflowId) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-foreground mb-4 text-3xl font-bold">
            {t('job_results.errors.no_results')}
          </h1>
          <p className="text-muted-foreground mb-6 text-lg">
            No workflow ID provided. Please select a search from your uploads.
          </p>
          <Link href="/dashboard/uploads">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Uploads
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <JobResults 
      workflowId={workflowId as WorkflowId}
      onBackToUpload={() => window.history.back()}
    />
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="bg-accent/50 mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
          </div>
          <p className="text-foreground text-lg font-medium mt-4">Loading results...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
} 