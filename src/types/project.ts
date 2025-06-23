export interface ProjectCreate {
  name: string;
  user_id: string;
  description?: string;
  sheet_link?: string;
  no_of_mailbox: number;
  response_sheet_link?: string;
  emails_per_mailbox: number;
  email_per_contact: number;
  batch_duration_days: number;
  contact_limit_very_small: number;
  contact_limit_small_company: number;
  contact_limit_medium_company: number;
  contact_limit_large_company: number;
  contact_limit_enterprise: number;
  company_size_very_small_max: number;
  company_size_small_max: number;
  company_size_medium_max: number;
  company_size_large_max: number;
  company_size_enterprise_min: number;
  days_between_contacts: number;
  follow_up_cycle_days: number;
  target_departments: string[];
  excluded_departments: string[];
  seniority_tier_1: string[];
  seniority_tier_2: string[];
  seniority_tier_3: string[];
  seniority_excluded: string[];
}

export interface ProjectResponse extends ProjectCreate {
  id: string;
  status: 'NULL' | 'ONGOING' | 'COMPLETED';
  logs: string[];
  row_completed: number;
  total_row: number;
}

export type ProjectStatus = 'NULL' | 'ONGOING' | 'COMPLETED';