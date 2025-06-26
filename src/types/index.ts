export interface User {
  email: string;
  uuid: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  uuid: string;
}

export interface Project {
  id: string;
  userId: string;
  projectName: string;
  description: string;
  targetAudience: string;
  dataSource: 'excel' | 'googlesheet';
  googleSheetLink?: string;
  excelFile?: File;
  aiModelProvider: string;
  emailCapacity: {
    mailboxes: number;
    emailsPerMailbox: number;
    batchDuration: number;
    emailsPerContact: number;
    processValidEmails: boolean;
  };
  companyTargeting: CompanyTargetingSettings[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  // Phase 1: Project Details
  projectName: string;
  description: string;
  targetAudience: string;
  
  // Phase 2: Upload Data
  dataSource: 'excel' | 'googlesheet';
  excelFile?: File;
  googleSheetLink?: string;
  
  // Phase 3: Settings
  emailCapacity: {
    mailboxes: number;
    emailsPerMailbox: number;
    batchDuration: number;
    emailsPerContact: number;
    processValidEmails: boolean;
  };
  aiModel: {
    provider: string;
    openaiKey?: string;
    geminiKey?: string;
    claudeKey?: string;
    exaKey?: string;
    ssmKey?: string;
  };
  
  // Updated to match backend schema exactly
  prompts?: {
    customPromptForExaCompanyInformationExtraction?: string;
    icebreakerPersonalizedSystemPrompt?: string;
    icebreakerPersonalizedUserPrompt?: string;
  };
  
  // Company size limits (backend required fields)
  companySizeLimits?: {
    verySmallMax: number;
    smallMax: number;
    mediumMax: number;
    largeMax: number;
    enterpriseMin: number;
  };
  
  // Contact limits per company size
  contactLimits?: {
    verySmall: number;
    smallCompany: number;
    mediumCompany: number;
    largeCompany: number;
    enterprise: number;
  };
  
  // Detailed targeting by company size
  companyTargetingBySize?: {
    verySmall: CompanySizeTargeting;
    small: CompanySizeTargeting;
    medium: CompanySizeTargeting;
    large: CompanySizeTargeting;
    enterprise: CompanySizeTargeting;
  };
  
  // Timing settings
  timingSettings?: {
    daysBetweenContacts: number;
    followUpCycleDays: number;
  };
}

export interface CompanySizeTargeting {
  primaryTargetRoles: string[];
  secondaryTargetRoles: string[];
  exclusionRoles: string[];
  targetDepartments: string[];
  exclusionDepartments: string[];
}

export interface CompanyTargetingSettings {
  companySize: string;
  numberOfContacts: number;
  primaryTargetRoles: string;
  secondaryTargetRoles: string;
  exclusionRoles: string;
  targetDepartments: string;
  exclusionDepartments: string;
}