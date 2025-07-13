/**
 * Utility functions to get translation keys for backend enum values
 */

// Job types
export const getJobTypeKey = (jobType: string): string => {
  const validTypes = ['full_time', 'part_time', 'contract', 'remote'];
  const type = validTypes.includes(jobType) ? jobType : 'full_time';
  return `job_results.job_types.${type}`;
};

// Experience levels
export const getExperienceLevelKey = (level: string): string => {
  const validLevels = ['entry', 'mid', 'senior', 'executive'];
  const experienceLevel = validLevels.includes(level) ? level : 'mid';
  return `job_results.experience_levels.${experienceLevel}`;
};

// Experience match levels
export const getExperienceMatchKey = (match: string): string => {
  const validMatches = [
    'excellent_match',
    'good_match',
    'partial_match',
    'mismatch',
    'not_specified',
  ];
  const experienceMatch = validMatches.includes(match) ? match : 'not_specified';
  return `job_results.experience_match.${experienceMatch}`;
};

// Location match levels
export const getLocationMatchKey = (match: string): string => {
  const validMatches = [
    'location_match',
    'location_mismatch',
    'no_location_provided',
    'not_specified',
  ];
  const locationMatch = validMatches.includes(match) ? match : 'not_specified';
  return `job_results.location_match.${locationMatch}`;
};

// AI recommendations
export const getAIRecommendationKey = (recommendation: string): string => {
  const validRecommendations = ['highly_recommended', 'recommended', 'consider', 'not_recommended'];
  const aiRecommendation = validRecommendations.includes(recommendation)
    ? recommendation
    : 'consider';
  return `job_results.ai_recommendations.${aiRecommendation}`;
};

// Work types (for survey)
export const getWorkTypeKey = (workType: string): string => {
  const validTypes = ['Remote', 'Hybrid', 'On-site'];
  const type = validTypes.includes(workType) ? workType : 'Remote';
  return `job_results.work_types.${type}`;
};

// Experience years (for survey)
export const getExperienceYearsKey = (years: string): string => {
  const validYears = ['0-1', '2-4', '5-8', '9+'];
  const experienceYears = validYears.includes(years) ? years : '0-1';
  return `job_results.experience_years.${experienceYears}`;
};

// Career levels (for survey)
export const getCareerLevelKey = (level: string): string => {
  const validLevels = ['Student', 'Entry', 'Mid', 'Senior', 'Lead', 'Manager'];
  const careerLevel = validLevels.includes(level) ? level : 'Entry';
  return `job_results.career_levels.${careerLevel}`;
};

// Get job type color classes
export const getJobTypeColor = (jobType: string): string => {
  switch (jobType) {
    case 'full_time':
      return 'bg-green-100 text-green-800';
    case 'part_time':
      return 'bg-blue-100 text-blue-800';
    case 'contract':
      return 'bg-purple-100 text-purple-800';
    case 'remote':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get match score color classes
export const getMatchScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 75) return 'text-blue-600 bg-blue-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};
