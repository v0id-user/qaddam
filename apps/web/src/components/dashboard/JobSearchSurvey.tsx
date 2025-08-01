'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useLogger } from '@/lib/axiom/client';

interface SurveyData {
  profession: string;
  experience: string;
  careerLevel: string;
  jobTitles: string[];
  industries: string[];
  workType: string;
  locations: string[];
  skills: string[];
  languages: { language: string; proficiency: string }[];
  companyTypes: string[];
}

interface JobSearchSurveyProps {
  onComplete: () => void;
}

export function JobSearchSurvey({ onComplete }: JobSearchSurveyProps) {
  const logger = useLogger();
  const t = useTranslations('dashboard.survey');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveSurvey = useMutation(api.surveys.saveSurvey);

  const [surveyData, setSurveyData] = useState<SurveyData>({
    profession: '',
    experience: '',
    careerLevel: '',
    jobTitles: [],
    industries: [],
    workType: '',
    locations: [],
    skills: [],
    languages: [],
    companyTypes: [],
  });

  const totalSteps = 8;

  // Tech-focused options
  const techProfessions = [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Data Engineer',
    'Data Analyst',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'Cybersecurity Specialist',
    'Cloud Engineer',
    'AI/ML Engineer',
    'System Administrator',
    'Technical Writer',
  ];

  const techJobTitles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Lead Developer',
    'Principal Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Mobile Developer',
    'React Developer',
    'Node.js Developer',
    'Python Developer',
    'Java Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Data Engineer',
    'Machine Learning Engineer',
    'Product Manager',
    'Technical Product Manager',
    'UI Designer',
    'UX Designer',
    'QA Engineer',
    'Test Engineer',
    'Cybersecurity Engineer',
    'Cloud Architect',
    'Solutions Architect',
    'Engineering Manager',
    'Technical Lead',
  ];

  const techSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express',
    'Python',
    'Django',
    'Flask',
    'Java',
    'Spring Boot',
    'C#',
    '.NET',
    'Go',
    'PHP',
    'Laravel',
    'Ruby',
    'Rails',
    'Swift',
    'Kotlin',
    'Flutter',
    'React Native',
    'HTML',
    'CSS',
    'Sass',
    'Tailwind CSS',
    'Bootstrap',
    'SQL',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Git',
    'GitHub',
    'GitLab',
    'CI/CD',
    'Jenkins',
    'Linux',
    'Bash',
    'GraphQL',
    'REST APIs',
    'Microservices',
    'Agile',
    'Scrum',
    'Figma',
    'Adobe XD',
  ];

  const techLocations = [
    'Remote',
    'Riyadh',
    'Jeddah',
    'Dammam',
    'Khobar',
    'Mecca',
    'Medina',
    'Tabuk',
    'Dubai',
    'Abu Dhabi',
    'Doha',
    'Kuwait City',
    'Manama',
    'Muscat',
    'Cairo',
    'Amman',
    'Beirut',
    'Baghdad',
    'Tunis',
    'Casablanca',
    'London',
    'Berlin',
    'Amsterdam',
    'Paris',
    'Toronto',
    'New York',
    'San Francisco',
  ];

  const experienceOptions = ['0-1', '2-4', '5-8', '9+'];
  const careerLevelOptions = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager'];
  const workTypeOptions = ['Remote', 'Hybrid', 'On-site'];
  //  const companyTypeOptions = ['Startup', 'SME', 'Enterprise', 'Any'];

  const handleNext = () => {
    if (!canProceed(currentStep)) {
      // Show validation toast based on current step
      const validationMessages = {
        0: 'toasts.validation.profession',
        1: 'toasts.validation.experience',
        2: 'toasts.validation.career_level',
        3: 'toasts.validation.job_titles',
        4: 'toasts.validation.skills',
        5: 'toasts.validation.work_type',
        6: 'toasts.validation.locations',
      };

      const messageKey = validationMessages[currentStep as keyof typeof validationMessages];
      if (messageKey) {
        toast.error(t(messageKey));
      }
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);

      // Show milestone toast when reaching review step
      if (currentStep + 1 === totalSteps - 1) {
        toast.success(
          '🎯 ' +
            (locale === 'ar' ? 'ممتاز! خطوة أخيرة للانتهاء' : 'Great! One final step to finish')
        );
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalSurveyData = {
        ...surveyData,
        languages: [{ language: 'English', proficiency: 'Fluent' }], // Default for tech
        industries: ['Technology'], // Auto-set to Technology for tech-focused survey
        companyTypes: ['Any'], // Default to Any since we're not asking this question
      };

      // Log all collected survey data to console
      logger.info(
        '=== SURVEY COMPLETED ===\n' +
          `📊 Survey Data: ${JSON.stringify(finalSurveyData, null, 2)}\n` +
          `👨‍💻 Profession: ${finalSurveyData.profession}\n` +
          `📅 Experience: ${finalSurveyData.experience}\n` +
          `🎯 Career Level: ${finalSurveyData.careerLevel}\n` +
          `💼 Job Titles: ${finalSurveyData.jobTitles.join(', ')}\n` +
          `🏢 Industries: ${finalSurveyData.industries.join(', ')}\n` +
          `🏠 Work Type: ${finalSurveyData.workType}\n` +
          `🌍 Locations: ${finalSurveyData.locations.join(', ')}\n` +
          `⚡ Skills: ${finalSurveyData.skills.join(', ')}\n` +
          `🗣️ Languages: ${finalSurveyData.languages.map(l => `${l.language} (${l.proficiency})`).join(', ')}\n` +
          `🏆 Company Types: ${finalSurveyData.companyTypes.join(', ')}\n` +
          '========================'
      );

      const result = await saveSurvey(finalSurveyData);
      logger.info('✅ Backend response:', result);

      // Show success toast
      toast.success(t('toasts.success'));

      onComplete();
    } catch (error) {
      logger.error('❌ Error saving survey:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Show error toast
      toast.error(t('toasts.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayItem = (field: keyof SurveyData, value: string) => {
    const currentValues = surveyData[field] as string[];
    if (currentValues.includes(value)) {
      setSurveyData(prev => ({
        ...prev,
        [field]: currentValues.filter(item => item !== value),
      }));
    } else {
      // Check skills limit
      if (field === 'skills' && currentValues.length >= 8) {
        toast.error(t('toasts.skills_limit'));
        return;
      }

      setSurveyData(prev => ({
        ...prev,
        [field]: [...currentValues, value],
      }));
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return surveyData.profession !== '';
      case 1:
        return surveyData.experience !== '';
      case 2:
        return surveyData.careerLevel !== '';
      case 3:
        return surveyData.jobTitles.length > 0;
      case 4:
        return surveyData.skills.length > 0;
      case 5:
        return surveyData.workType !== '';
      case 6:
        return surveyData.locations.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Tech Profession
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.profession.title')}</Label>
            <div className="grid grid-cols-2 gap-3">
              {techProfessions.map(profession => (
                <Button
                  key={profession}
                  variant={surveyData.profession === profession ? 'default' : 'outline'}
                  onClick={() => setSurveyData(prev => ({ ...prev, profession }))}
                  className="h-12 text-sm"
                >
                  {profession}
                </Button>
              ))}
            </div>
          </div>
        );

      case 1: // Experience
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.experience.title')}</Label>
            <div className="grid grid-cols-2 gap-4">
              {experienceOptions.map(option => (
                <Button
                  key={option}
                  variant={surveyData.experience === option ? 'default' : 'outline'}
                  onClick={() => setSurveyData(prev => ({ ...prev, experience: option }))}
                  className="h-16 text-lg"
                >
                  {t(`steps.experience.options.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        );

      case 2: // Career Level
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.career_level.title')}</Label>
            <div className="grid grid-cols-2 gap-4">
              {careerLevelOptions.map(option => (
                <Button
                  key={option}
                  variant={surveyData.careerLevel === option ? 'default' : 'outline'}
                  onClick={() => setSurveyData(prev => ({ ...prev, careerLevel: option }))}
                  className="h-16 text-lg"
                >
                  {t(`steps.career_level.options.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        );

      case 3: // Tech Job Titles
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.job_titles.title')}</Label>
            <p className="text-muted-foreground text-sm">{t('steps.job_titles.description')}</p>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {techJobTitles.map(title => (
                <Button
                  key={title}
                  variant={surveyData.jobTitles.includes(title) ? 'default' : 'outline'}
                  onClick={() => toggleArrayItem('jobTitles', title)}
                  className="h-10 justify-start text-sm"
                >
                  {surveyData.jobTitles.includes(title) && <Check className="mr-2 h-4 w-4" />}
                  {title}
                </Button>
              ))}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('selected_count.titles', { count: surveyData.jobTitles.length })}
            </div>
          </div>
        );

      case 4: // Tech Skills
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.skills.title')}</Label>
            <p className="text-muted-foreground text-sm">{t('steps.skills.description')}</p>
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
              {techSkills.map(skill => (
                <Button
                  key={skill}
                  variant={surveyData.skills.includes(skill) ? 'default' : 'outline'}
                  onClick={() => toggleArrayItem('skills', skill)}
                  className="h-10 text-sm"
                  disabled={!surveyData.skills.includes(skill) && surveyData.skills.length >= 8}
                >
                  {surveyData.skills.includes(skill) && <Check className="mr-1 h-4 w-4" />}
                  {skill}
                </Button>
              ))}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('selected_count.skills', { count: surveyData.skills.length })}
            </div>
          </div>
        );

      case 5: // Work Type
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.work_type.title')}</Label>
            <div className="grid grid-cols-3 gap-4">
              {workTypeOptions.map(option => (
                <Button
                  key={option}
                  variant={surveyData.workType === option ? 'default' : 'outline'}
                  onClick={() => setSurveyData(prev => ({ ...prev, workType: option }))}
                  className="h-16 text-lg"
                >
                  {t(`steps.work_type.options.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        );

      case 6: // Locations
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t('steps.locations.title')}</Label>
            <p className="text-muted-foreground text-sm">{t('steps.locations.description')}</p>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {techLocations.map(location => (
                <Button
                  key={location}
                  variant={surveyData.locations.includes(location) ? 'default' : 'outline'}
                  onClick={() => toggleArrayItem('locations', location)}
                  className="h-10 justify-start text-sm"
                >
                  {surveyData.locations.includes(location) && <Check className="mr-2 h-4 w-4" />}
                  {location}
                </Button>
              ))}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('selected_count.locations', { count: surveyData.locations.length })}
            </div>
          </div>
        );

      case 7: // Review
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-primary text-sm font-medium">
                    {t('review.labels.profession')}
                  </Label>
                  <p className="bg-secondary rounded p-2 text-sm">{surveyData.profession}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-primary text-sm font-medium">
                      {t('review.labels.experience')}
                    </Label>
                    <p className="bg-secondary rounded p-2 text-sm">
                      {t(`steps.experience.options.${surveyData.experience}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-primary text-sm font-medium">
                      {t('review.labels.level')}
                    </Label>
                    <p className="bg-secondary rounded p-2 text-sm">
                      {t(`steps.career_level.options.${surveyData.careerLevel}`)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-primary text-sm font-medium">
                    {t('review.labels.job_titles')} ({surveyData.jobTitles.length})
                  </Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {surveyData.jobTitles.slice(0, 5).map((title, index) => (
                      <span
                        key={index}
                        className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs"
                      >
                        {title}
                      </span>
                    ))}
                    {surveyData.jobTitles.length > 5 && (
                      <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                        {t('more_items', { count: surveyData.jobTitles.length - 5 })}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-primary text-sm font-medium">
                    {t('review.labels.skills')} ({surveyData.skills.length})
                  </Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {surveyData.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-primary text-sm font-medium">
                      {t('review.labels.work_type')}
                    </Label>
                    <p className="bg-secondary rounded p-2 text-sm">
                      {t(`steps.work_type.options.${surveyData.workType}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-primary text-sm font-medium">
                      {t('review.labels.locations')} ({surveyData.locations.length})
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {surveyData.locations.slice(0, 3).map((location, index) => (
                        <span
                          key={index}
                          className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs"
                        >
                          {location}
                        </span>
                      ))}
                      {surveyData.locations.length > 3 && (
                        <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                          {t('more_items', { count: surveyData.locations.length - 3 })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background/95 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">🚀 {t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </div>
            <div className="text-muted-foreground text-sm">
              {t('step_progress', { current: currentStep + 1, total: totalSteps })}
            </div>
          </div>
          <div className="bg-secondary/50 h-1.5 w-full rounded-full">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {t('back')}
            </Button>

            <div className="flex gap-3">
              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {t('review.submit')}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed(currentStep)}
                  className="flex items-center gap-2"
                >
                  {t('next')}
                  {isRTL ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
