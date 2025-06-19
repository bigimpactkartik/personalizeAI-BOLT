import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          description: string;
          target_audience: string;
          data_source: 'excel' | 'googlesheet';
          google_sheet_link: string | null;
          excel_file_path: string | null;
          ai_model_provider: string;
          email_capacity: {
            mailboxes: number;
            emailsPerMailbox: number;
            batchDuration: number;
            emailsPerContact: number;
            processValidEmails: boolean;
          };
          company_targeting: Array<{
            companySize: string;
            numberOfContacts: number;
            primaryTargetRoles: string;
            secondaryTargetRoles: string;
            exclusionRoles: string;
            targetDepartments: string;
            exclusionDepartments: string;
          }>;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          progress: number;
          result_file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name: string;
          description: string;
          target_audience: string;
          data_source: 'excel' | 'googlesheet';
          google_sheet_link?: string | null;
          excel_file_path?: string | null;
          ai_model_provider: string;
          email_capacity: {
            mailboxes: number;
            emailsPerMailbox: number;
            batchDuration: number;
            emailsPerContact: number;
            processValidEmails: boolean;
          };
          company_targeting: Array<{
            companySize: string;
            numberOfContacts: number;
            primaryTargetRoles: string;
            secondaryTargetRoles: string;
            exclusionRoles: string;
            targetDepartments: string;
            exclusionDepartments: string;
          }>;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number;
          result_file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_name?: string;
          description?: string;
          target_audience?: string;
          data_source?: 'excel' | 'googlesheet';
          google_sheet_link?: string | null;
          excel_file_path?: string | null;
          ai_model_provider?: string;
          email_capacity?: {
            mailboxes: number;
            emailsPerMailbox: number;
            batchDuration: number;
            emailsPerContact: number;
            processValidEmails: boolean;
          };
          company_targeting?: Array<{
            companySize: string;
            numberOfContacts: number;
            primaryTargetRoles: string;
            secondaryTargetRoles: string;
            exclusionRoles: string;
            targetDepartments: string;
            exclusionDepartments: string;
          }>;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number;
          result_file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}