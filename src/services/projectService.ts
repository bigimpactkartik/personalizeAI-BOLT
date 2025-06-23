import apiClient from './api';
import { ProjectFormData } from '../types';

export interface ProjectCreateRequest {
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

export interface ProjectResponse {
  id: string;
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
  status: string;
  logs: string[];
  row_completed: number;
  total_row: number;
}

class ProjectService {
  private static instance: ProjectService;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async createProject(projectData: ProjectFormData, userId: string): Promise<ProjectResponse> {
    try {
      const requestData: ProjectCreateRequest = this.transformFormDataToRequest(projectData, userId);
      const response = await apiClient.post('/project', requestData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create project');
    }
  }

  async getUserProjects(userId: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/projects/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch projects');
    }
  }

  async getProjectById(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await apiClient.get(`/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch project details');
    }
  }

  async downloadProjectSheet(projectId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/project/${projectId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to download project sheet');
    }
  }

  private transformFormDataToRequest(formData: ProjectFormData, userId: string): ProjectCreateRequest {
    return {
      name: formData.projectName,
      user_id: userId,
      description: formData.description,
      sheet_link: formData.dataSource === 'googlesheet' ? formData.googleSheetLink : undefined,
      no_of_mailbox: formData.emailCapacity.mailboxes,
      emails_per_mailbox: formData.emailCapacity.emailsPerMailbox,
      email_per_contact: formData.emailCapacity.emailsPerContact,
      batch_duration_days: formData.emailCapacity.batchDuration,
      contact_limit_very_small: formData.companyTargeting[0]?.numberOfContacts || 2,
      contact_limit_small_company: formData.companyTargeting[1]?.numberOfContacts || 3,
      contact_limit_medium_company: formData.companyTargeting[2]?.numberOfContacts || 4,
      contact_limit_large_company: formData.companyTargeting[3]?.numberOfContacts || 5,
      contact_limit_enterprise: formData.companyTargeting[4]?.numberOfContacts || 6,
      company_size_very_small_max: 10,
      company_size_small_max: 50,
      company_size_medium_max: 200,
      company_size_large_max: 1000,
      company_size_enterprise_min: 1001,
      days_between_contacts: 3,
      follow_up_cycle_days: 7,
      target_departments: this.extractDepartments(formData.companyTargeting, 'target'),
      excluded_departments: this.extractDepartments(formData.companyTargeting, 'excluded'),
      seniority_tier_1: this.extractRoles(formData.companyTargeting, 'primary'),
      seniority_tier_2: this.extractRoles(formData.companyTargeting, 'secondary'),
      seniority_tier_3: [],
      seniority_excluded: this.extractRoles(formData.companyTargeting, 'excluded')
    };
  }

  private extractDepartments(targeting: any[], type: 'target' | 'excluded'): string[] {
    const departments = targeting
      .map(t => type === 'target' ? t.targetDepartments : t.exclusionDepartments)
      .filter(Boolean)
      .join(',')
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
    
    return [...new Set(departments)];
  }

  private extractRoles(targeting: any[], type: 'primary' | 'secondary' | 'excluded'): string[] {
    const roles = targeting
      .map(t => {
        switch (type) {
          case 'primary': return t.primaryTargetRoles;
          case 'secondary': return t.secondaryTargetRoles;
          case 'excluded': return t.exclusionRoles;
          default: return '';
        }
      })
      .filter(Boolean)
      .join(',')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);
    
    return [...new Set(roles)];
  }
}

export default ProjectService.getInstance();