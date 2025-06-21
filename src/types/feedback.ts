export interface ProjectFeedback {
  id: string;
  projectId: string;
  userId: string;
  
  // Overall Project Experience
  overallSatisfactionRating: number; // 1-5 stars
  experienceDescription: string; // max 500 characters
  
  // Project Performance
  processingSpeedRating: number; // 1-5 stars
  systemResponsivenessRating: number; // 1-5 stars
  userInterfaceRating: number; // 1-5 stars
  
  // Quality Assessment
  metRequirements: boolean;
  requirementsExplanation: string; // explanation for yes/no
  deliverablesOnTime: boolean;
  overallQualityRating: number; // 1-5 stars
  
  // Areas for Improvement
  desiredFeatures: string; // max 300 characters
  improvementAspects: string[]; // array of selected aspects
  improvementOther: string; // if "Other" is selected
  
  // Additional Comments
  additionalComments: string; // max 1000 characters
  
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFormData {
  overallSatisfactionRating: number;
  experienceDescription: string;
  processingSpeedRating: number;
  systemResponsivenessRating: number;
  userInterfaceRating: number;
  metRequirements: boolean;
  requirementsExplanation: string;
  deliverablesOnTime: boolean;
  overallQualityRating: number;
  desiredFeatures: string;
  improvementAspects: string[];
  improvementOther: string;
  additionalComments: string;
}

export const IMPROVEMENT_ASPECTS = [
  'Performance',
  'User Interface',
  'Documentation',
  'Support',
  'Other'
] as const;

export type ImprovementAspect = typeof IMPROVEMENT_ASPECTS[number];