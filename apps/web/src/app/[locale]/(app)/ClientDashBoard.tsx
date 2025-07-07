'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { JobSearchSurvey } from '@/components/dashboard/JobSearchSurvey';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';

export default function ClientDashBoard() {
  const me = useQuery(api.users.getMe);
  const userSurvey = useQuery(api.users.getUserSurvey);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    // Check if user has completed the survey
    const surveyCompleted = localStorage.getItem('qaddam_survey_completed');
    
    // Show survey if:
    // 1. User data is loaded
    // 2. User hasn't completed survey in localStorage
    // 3. User doesn't have survey data in backend
    if (me && !surveyCompleted && userSurvey === null) {
      setShowSurvey(true);
    }
  }, [me, userSurvey]);

  const handleSurveyComplete = () => {
    setShowSurvey(false);
  };

  if (!me) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      {showSurvey && <JobSearchSurvey onComplete={handleSurveyComplete} />}
      <DashboardSidebar 
        variant="sidebar"
        user={{
          name: me.name ?? '',
          email: me.email ?? '',
          avatar: me.image ?? '',
        }}
      />
    </>
  );
}