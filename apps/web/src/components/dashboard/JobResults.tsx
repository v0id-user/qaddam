'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import JobCard from '@/components/dashboard/JobCard';
import JobMatchInsights from '@/components/dashboard/JobMatchInsights';
import type { JobResult } from './types';

// Mock data for testing
const mockJobs: JobResult[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'Riyadh, Saudi Arabia',
    type: 'full_time',
    salary: '$60,000 - $80,000',
    remote: true,
    url: 'https://techcorp.com/jobs/senior-frontend-dev',
    matchScore: 92,
    description:
      'We are looking for a senior frontend developer to join our team and build amazing user interfaces.',
    requirements: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
    benefits: ['Health Insurance', 'Remote Work', 'Professional Development'],
    postedDate: '2025-01-15',
    matchedSkills: ['React', 'TypeScript', 'Next.js', 'JavaScript'],
    missingSkills: ['Vue.js', 'Angular'],
    experienceMatch: 'Perfect match - 5+ years required',
    locationMatch: 'Same city preferred',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupHub',
    location: 'Dubai, UAE',
    type: 'remote',
    salary: '$50,000 - $70,000',
    remote: true,
    url: 'https://startuphub.com/careers/fullstack-dev',
    matchScore: 85,
    description:
      'Join our innovative startup and work on cutting-edge projects with modern technologies.',
    requirements: ['Node.js', 'React', 'MongoDB', 'Express'],
    benefits: ['Flexible Hours', 'Stock Options', 'Learning Budget'],
    postedDate: '2025-01-14',
    matchedSkills: ['Node.js', 'React', 'MongoDB'],
    missingSkills: ['Express', 'GraphQL'],
    experienceMatch: 'Good match - 3+ years required',
    locationMatch: 'Remote work available',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'DesignStudio',
    location: 'Jeddah, Saudi Arabia',
    type: 'contract',
    salary: '$40,000 - $55,000',
    remote: false,
    url: 'https://designstudio.com/jobs/ux-designer',
    matchScore: 78,
    description: 'Create beautiful and intuitive user experiences for our digital products.',
    requirements: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    benefits: ['Creative Freedom', 'Flexible Schedule', 'Portfolio Projects'],
    postedDate: '2025-01-13',
    matchedSkills: ['Figma', 'Adobe Creative Suite'],
    missingSkills: ['User Research', 'Prototyping'],
    experienceMatch: 'Moderate match - 2+ years required',
    locationMatch: 'Different city - relocation possible',
  },
  {
    id: '4',
    title: 'Backend Developer',
    company: 'DataTech',
    location: 'Cairo, Egypt',
    type: 'full_time',
    salary: '$45,000 - $65,000',
    remote: true,
    url: 'https://datatech.com/careers/backend-dev',
    matchScore: 73,
    description: 'Build scalable backend systems and APIs for our data-driven applications.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    benefits: ['Health Insurance', 'Annual Bonus', 'Training Programs'],
    postedDate: '2025-01-12',
    matchedSkills: ['Python', 'PostgreSQL'],
    missingSkills: ['Django', 'Redis', 'Docker'],
    experienceMatch: 'Good match - 3+ years required',
    locationMatch: 'Different country - visa support available',
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'MobileFirst',
    location: 'Kuwait City, Kuwait',
    type: 'part_time',
    salary: '$30,000 - $45,000',
    remote: true,
    url: 'https://mobilefirst.com/jobs/mobile-dev',
    matchScore: 68,
    description: 'Develop cross-platform mobile applications using React Native.',
    requirements: ['React Native', 'JavaScript', 'iOS', 'Android'],
    benefits: ['Flexible Hours', 'Remote Work', 'Project Bonuses'],
    postedDate: '2025-01-11',
    matchedSkills: ['React Native', 'JavaScript'],
    missingSkills: ['iOS Development', 'Android Development'],
    experienceMatch: 'Entry level - 1+ years required',
    locationMatch: 'Different country - remote work possible',
  },
];

interface JobResultsProps {
  jobResults?: any;
  onBackToUpload: () => void;
}

const JobResults = ({ jobResults, onBackToUpload }: JobResultsProps) => {
  const t = useTranslations('dashboard');
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Use real job results if available, fallback to mock data
  const jobs = jobResults?.jobs || mockJobs;
  const jobCount = jobResults?.totalFound || mockJobs.length;

  const handleJobClick = (job: JobResult) => {
    setSelectedJob(job);
    setIsInsightsOpen(true);
  };

  const handleCloseInsights = () => {
    setIsInsightsOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="from-accent/30 via-background to-secondary/20 min-h-screen bg-gradient-to-br px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            {t('job_results.title')}
          </h1>
          <p className="text-muted-foreground mb-4 text-xl leading-relaxed">
            {t('job_results.subtitle')}
          </p>
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="bg-primary/10 inline-flex items-center rounded-full px-4 py-2">
              <span className="text-primary font-semibold">
                {t('job_results.found_jobs', { count: jobCount })}
              </span>
            </div>
            <Button
              onClick={onBackToUpload}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 rounded-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('job_results.upload_new_cv')}
            </Button>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: JobResult) => (
            <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
          ))}
        </div>

        {/* Job Match Insights Modal */}
        {isInsightsOpen && selectedJob && (
          <JobMatchInsights job={selectedJob} onClose={handleCloseInsights} />
        )}
      </div>
    </div>
  );
};

export default JobResults;
