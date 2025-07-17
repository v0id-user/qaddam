'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { JobSearchSurvey } from '@/components/dashboard/JobSearchSurvey';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import posthog from 'posthog-js';
import { useLogger } from '@/lib/axiom/client';

export default function ClientDashBoard() {
  const logger = useLogger();
  const me = useQuery(api.users.getMe);
  const hasSurveyCompleted = useQuery(api.surveys.hasSurveyCompleted);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    // Show survey if user is loaded and hasn't completed survey
    if (me && hasSurveyCompleted === false) {
      logger.info('🎯 Showing survey - first time user detected');
      setShowSurvey(true);
    } else if (me && hasSurveyCompleted === true) {
      logger.info('✅ Survey already completed');
      setShowSurvey(false);
    }

    // Identify user for posthog
    if (me) {
      posthog.identify(me.email);
    }
  }, [me, hasSurveyCompleted]);

  const handleSurveyComplete = () => {
    logger.info('🎉 Survey completed callback triggered');
    setShowSurvey(false);
  };

  if (!me) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  logger.info('🔍 Dashboard state:', {
    userLoaded: !!me,
    hasSurveyCompleted,
    showSurvey,
    isPro: me.isPro,
  });

  return (
    <>
      {showSurvey && <JobSearchSurvey onComplete={handleSurveyComplete} />}
      <DashboardSidebar
        variant="sidebar"
        user={{
          name: me.name ?? '',
          email: me.email ?? '',
          avatar: me.image ?? '',
          isPro: me.isPro,
        }}
      />
    </>
  );
}
