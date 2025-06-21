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

// General platform feedback interface
export interface PlatformFeedback {
  id: string;
  userId: string;
  
  // Overall Experience
  overallRating: number; // 1-5 stars
  category: FeedbackCategory;
  
  // Detailed Comments
  comments: string; // max 1000 characters
  
  // Contact Information (optional)
  contactForFollowUp: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFeedbackFormData {
  overallRating: number;
  category: FeedbackCategory;
  comments: string;
  contactForFollowUp: boolean;
}

export type FeedbackCategory = 
  | 'ui-ux' 
  | 'performance' 
  | 'features' 
  | 'support' 
  | 'pricing' 
  | 'general';

export const FEEDBACK_CATEGORIES = [
  { value: 'ui-ux', label: 'UI/UX Design', description: 'Interface design and user experience' },
  { value: 'performance', label: 'Performance', description: 'Speed, responsiveness, and reliability' },
  { value: 'features', label: 'Features', description: 'Functionality and feature requests' },
  { value: 'support', label: 'Support', description: 'Customer service and documentation' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing plans and value proposition' },
  { value: 'general', label: 'General', description: 'Overall feedback and suggestions' }
] as const;

export const IMPROVEMENT_ASPECTS = [
  'Performance',
  'User Interface',
  'Documentation',
  'Support',
  'Other'
] as const;

export type ImprovementAspect = typeof IMPROVEMENT_ASPECTS[number];