import apiClient from './api';
import { ProjectFormData } from '../types';

export interface ProjectCreateRequest {
  name: string;
  user_id: string;
  description?: string;
  sheet_link?: string;
  no_of_mailbox: number;
  emails_per_mailbox: number;
  email_per_contact: number;
  batch_duration_days: number;
  
  // Required prompts
  custom_prompt_for_exa_company_information_extraction: string;
  icebreaker_personalized_system_prompt: string;
  icebreaker_personalized_user_prompt: string;
  
  // Contact limits by company size
  contact_limit_very_small: number;
  contact_limit_small_company: number;
  contact_limit_medium_company: number;
  contact_limit_large_company: number;
  contact_limit_enterprise: number;
  
  // Company size thresholds
  company_size_very_small_max: number;
  company_size_small_max: number;
  company_size_medium_max: number;
  company_size_large_max: number;
  company_size_enterprise_min: number;
  
  // Primary target roles by company size
  company_size_very_small_primary_target_roles: string[];
  company_size_small_primary_target_roles: string[];
  company_size_medium_primary_target_roles: string[];
  company_size_large_primary_target_roles: string[];
  company_size_enterprise_primary_target_roles: string[];
  
  // Secondary target roles by company size
  company_size_very_small_secondary_target_roles: string[];
  company_size_small_secondary_target_roles: string[];
  company_size_medium_secondary_target_roles: string[];
  company_size_large_secondary_target_roles: string[];
  company_size_enterprise_secondary_target_roles: string[];
  
  // Exclusion roles by company size
  company_size_very_small_exclusion_roles: string[];
  company_size_small_exclusion_roles: string[];
  company_size_medium_exclusion_roles: string[];
  company_size_large_exclusion_roles: string[];
  company_size_enterprise_exclusion_roles: string[];
  
  // Target departments by company size
  company_size_very_small_target_departments: string[];
  company_size_small_target_departments: string[];
  company_size_medium_target_departments: string[];
  company_size_large_target_departments: string[];
  company_size_enterprise_target_departments: string[];
  
  // Exclusion departments by company size
  company_size_very_small_exclusion_departments: string[];
  company_size_small_exclusion_departments: string[];
  company_size_medium_exclusion_departments: string[];
  company_size_large_exclusion_departments: string[];
  company_size_enterprise_exclusion_departments: string[];
  
  // Timing settings
  days_between_contacts: number;
  follow_up_cycle_days: number;
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
      
      // Required prompts
      custom_prompt_for_exa_company_information_extraction: formData.prompts.customPromptForExaCompanyInformationExtraction,
      icebreaker_personalized_system_prompt: formData.prompts.icebreakerPersonalizedSystemPrompt,
      icebreaker_personalized_user_prompt: formData.prompts.icebreakerPersonalizedUserPrompt,
      
      // Contact limits
      contact_limit_very_small: formData.contactLimits.verySmall,
      contact_limit_small_company: formData.contactLimits.smallCompany,
      contact_limit_medium_company: formData.contactLimits.mediumCompany,
      contact_limit_large_company: formData.contactLimits.largeCompany,
      contact_limit_enterprise: formData.contactLimits.enterprise,
      
      // Company size thresholds
      company_size_very_small_max: formData.companySizeLimits.verySmallMax,
      company_size_small_max: formData.companySizeLimits.smallMax,
      company_size_medium_max: formData.companySizeLimits.mediumMax,
      company_size_large_max: formData.companySizeLimits.largeMax,
      company_size_enterprise_min: formData.companySizeLimits.enterpriseMin,
      
      // Primary target roles by company size
      company_size_very_small_primary_target_roles: formData.companyTargetingBySize.verySmall.primaryTargetRoles,
      company_size_small_primary_target_roles: formData.companyTargetingBySize.small.primaryTargetRoles,
      company_size_medium_primary_target_roles: formData.companyTargetingBySize.medium.primaryTargetRoles,
      company_size_large_primary_target_roles: formData.companyTargetingBySize.large.primaryTargetRoles,
      company_size_enterprise_primary_target_roles: formData.companyTargetingBySize.enterprise.primaryTargetRoles,
      
      // Secondary target roles by company size
      company_size_very_small_secondary_target_roles: formData.companyTargetingBySize.verySmall.secondaryTargetRoles,
      company_size_small_secondary_target_roles: formData.companyTargetingBySize.small.secondaryTargetRoles,
      company_size_medium_secondary_target_roles: formData.companyTargetingBySize.medium.secondaryTargetRoles,
      company_size_large_secondary_target_roles: formData.companyTargetingBySize.large.secondaryTargetRoles,
      company_size_enterprise_secondary_target_roles: formData.companyTargetingBySize.enterprise.secondaryTargetRoles,
      
      // Exclusion roles by company size
      company_size_very_small_exclusion_roles: formData.companyTargetingBySize.verySmall.exclusionRoles,
      company_size_small_exclusion_roles: formData.companyTargetingBySize.small.exclusionRoles,
      company_size_medium_exclusion_roles: formData.companyTargetingBySize.medium.exclusionRoles,
      company_size_large_exclusion_roles: formData.companyTargetingBySize.large.exclusionRoles,
      company_size_enterprise_exclusion_roles: formData.companyTargetingBySize.enterprise.exclusionRoles,
      
      // Target departments by company size
      company_size_very_small_target_departments: formData.companyTargetingBySize.verySmall.targetDepartments,
      company_size_small_target_departments: formData.companyTargetingBySize.small.targetDepartments,
      company_size_medium_target_departments: formData.companyTargetingBySize.medium.targetDepartments,
      company_size_large_target_departments: formData.companyTargetingBySize.large.targetDepartments,
      company_size_enterprise_target_departments: formData.companyTargetingBySize.enterprise.targetDepartments,
      
      // Exclusion departments by company size
      company_size_very_small_exclusion_departments: formData.companyTargetingBySize.verySmall.exclusionDepartments,
      company_size_small_exclusion_departments: formData.companyTargetingBySize.small.exclusionDepartments,
      company_size_medium_exclusion_departments: formData.companyTargetingBySize.medium.exclusionDepartments,
      company_size_large_exclusion_departments: formData.companyTargetingBySize.large.exclusionDepartments,
      company_size_enterprise_exclusion_departments: formData.companyTargetingBySize.enterprise.exclusionDepartments,
      
      // Timing settings
      days_between_contacts: formData.timingSettings.daysBetweenContacts,
      follow_up_cycle_days: formData.timingSettings.followUpCycleDays
    };
  }
}

export default ProjectService.getInstance();