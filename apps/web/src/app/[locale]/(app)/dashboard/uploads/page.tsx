'use client';

import { useRouter } from 'next/navigation';
import UploadsHistory from '@/components/dashboard/UploadsHistory';

export default function UploadsPage() {
  const router = useRouter();

  const handleViewResults = (workflowId: string) => {
    // Navigate to results page with the workflow ID
    router.push(`/dashboard/results?workflowId=${workflowId}`);
  };

  return (
    <UploadsHistory 
      onViewResults={handleViewResults}
    />
  );
} 