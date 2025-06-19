import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
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