export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
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
    ssmKey?: string;
  };
  companyTargeting: CompanyTargetingSettings[];
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