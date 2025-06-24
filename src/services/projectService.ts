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
  
  // API Keys - now included in project creation
  openai_key?: string;
  exa_api_key?: string;
  ss_masters_key?: string;
  
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

  // Seniority tier fields required by backend
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

export interface StartProjectRequest {
  project_id: string;
  original_sheet_url: string;
  proceed_on_invalid_email: boolean;
  // API keys removed - backend should retrieve them from secure storage
}

export interface StartProjectResponse {
  message: string;
  project_id: string;
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
      // Check if Excel file is provided
      if (projectData.dataSource === 'excel' && projectData.excelFile) {
        // Use multipart/form-data for Excel file upload
        const formData = this.transformFormDataToFlatRequestForMultipart(projectData, userId);
        const response = await apiClient.post('/project', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Use JSON for Google Sheet data source
        const requestData: ProjectCreateRequest = this.transformFormDataToRequest(projectData, userId);
        const response = await apiClient.post('/project', requestData);
        return response.data;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create project');
    }
  }

  async startProject(projectId: string, projectData: {
    googleSheetLink: string;
    processValidEmails: boolean;
  }): Promise<StartProjectResponse> {
    try {
      const requestData: StartProjectRequest = {
        project_id: projectId,
        original_sheet_url: projectData.googleSheetLink,
        proceed_on_invalid_email: !projectData.processValidEmails
        // API keys removed - backend should retrieve them from secure storage
      };

      const response = await apiClient.post('/personalized-sheet', requestData);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for different types of failures
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail?.includes('Google Sheet')) {
          throw new Error('Failed to access Google Sheet. Please check the URL and permissions.');
        } else if (detail?.includes('required columns')) {
          throw new Error('Missing required columns in the sheet. Please check the data format.');
        } else if (detail?.includes('API key')) {
          throw new Error('Invalid API key provided. Please check your credentials.');
        } else {
          throw new Error(detail || 'Invalid request data. Please check your project settings.');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to start this project.');
      } else if (error.response?.status === 404) {
        throw new Error('Project not found. It may have been deleted.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error occurred. Please try again later or contact support.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response?.data?.detail || error.message || 'Failed to start project execution');
      }
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
      
      // API Keys - now included in project creation
      openai_key: formData.aiModel.openaiKey?.trim(),
      exa_api_key: formData.aiModel.exaKey?.trim(),
      ss_masters_key: formData.aiModel.ssmKey?.trim(),
      
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
      follow_up_cycle_days: formData.timingSettings.followUpCycleDays,

      // Seniority tier fields required by backend
      seniority_tier_1: formData.seniority_tier_1,
      seniority_tier_2: formData.seniority_tier_2,
      seniority_tier_3: formData.seniority_tier_3,
      seniority_excluded: formData.seniority_excluded
    };
  }

  private transformFormDataToFlatRequestForMultipart(formData: ProjectFormData, userId: string): FormData {
    const multipartFormData = new FormData();
    
    // Add the Excel file
    if (formData.excelFile) {
      multipartFormData.append('file', formData.excelFile);
    }
    
    // Add basic project information
    multipartFormData.append('name', formData.projectName);
    multipartFormData.append('user_id', userId);
    if (formData.description) {
      multipartFormData.append('description', formData.description);
    }
    
    // Add API Keys
    if (formData.aiModel.openaiKey?.trim()) {
      multipartFormData.append('openai_key', formData.aiModel.openaiKey.trim());
    }
    if (formData.aiModel.exaKey?.trim()) {
      multipartFormData.append('exa_api_key', formData.aiModel.exaKey.trim());
    }
    if (formData.aiModel.ssmKey?.trim()) {
      multipartFormData.append('ss_masters_key', formData.aiModel.ssmKey.trim());
    }
    
    // Add email capacity settings
    multipartFormData.append('no_of_mailbox', formData.emailCapacity.mailboxes.toString());
    multipartFormData.append('emails_per_mailbox', formData.emailCapacity.emailsPerMailbox.toString());
    multipartFormData.append('email_per_contact', formData.emailCapacity.emailsPerContact.toString());
    multipartFormData.append('batch_duration_days', formData.emailCapacity.batchDuration.toString());
    
    // Add required prompts
    multipartFormData.append('custom_prompt_for_exa_company_information_extraction', formData.prompts.customPromptForExaCompanyInformationExtraction);
    multipartFormData.append('icebreaker_personalized_system_prompt', formData.prompts.icebreakerPersonalizedSystemPrompt);
    multipartFormData.append('icebreaker_personalized_user_prompt', formData.prompts.icebreakerPersonalizedUserPrompt);
    
    // Add contact limits
    multipartFormData.append('contact_limit_very_small', formData.contactLimits.verySmall.toString());
    multipartFormData.append('contact_limit_small_company', formData.contactLimits.smallCompany.toString());
    multipartFormData.append('contact_limit_medium_company', formData.contactLimits.mediumCompany.toString());
    multipartFormData.append('contact_limit_large_company', formData.contactLimits.largeCompany.toString());
    multipartFormData.append('contact_limit_enterprise', formData.contactLimits.enterprise.toString());
    
    // Add company size thresholds
    multipartFormData.append('company_size_very_small_max', formData.companySizeLimits.verySmallMax.toString());
    multipartFormData.append('company_size_small_max', formData.companySizeLimits.smallMax.toString());
    multipartFormData.append('company_size_medium_max', formData.companySizeLimits.mediumMax.toString());
    multipartFormData.append('company_size_large_max', formData.companySizeLimits.largeMax.toString());
    multipartFormData.append('company_size_enterprise_min', formData.companySizeLimits.enterpriseMin.toString());
    
    // Add primary target roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_primary_target_roles', JSON.stringify(formData.companyTargetingBySize.verySmall.primaryTargetRoles));
    multipartFormData.append('company_size_small_primary_target_roles', JSON.stringify(formData.companyTargetingBySize.small.primaryTargetRoles));
    multipartFormData.append('company_size_medium_primary_target_roles', JSON.stringify(formData.companyTargetingBySize.medium.primaryTargetRoles));
    multipartFormData.append('company_size_large_primary_target_roles', JSON.stringify(formData.companyTargetingBySize.large.primaryTargetRoles));
    multipartFormData.append('company_size_enterprise_primary_target_roles', JSON.stringify(formData.companyTargetingBySize.enterprise.primaryTargetRoles));
    
    // Add secondary target roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_secondary_target_roles', JSON.stringify(formData.companyTargetingBySize.verySmall.secondaryTargetRoles));
    multipartFormData.append('company_size_small_secondary_target_roles', JSON.stringify(formData.companyTargetingBySize.small.secondaryTargetRoles));
    multipartFormData.append('company_size_medium_secondary_target_roles', JSON.stringify(formData.companyTargetingBySize.medium.secondaryTargetRoles));
    multipartFormData.append('company_size_large_secondary_target_roles', JSON.stringify(formData.companyTargetingBySize.large.secondaryTargetRoles));
    multipartFormData.append('company_size_enterprise_secondary_target_roles', JSON.stringify(formData.companyTargetingBySize.enterprise.secondaryTargetRoles));
    
    // Add exclusion roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_exclusion_roles', JSON.stringify(formData.companyTargetingBySize.verySmall.exclusionRoles));
    multipartFormData.append('company_size_small_exclusion_roles', JSON.stringify(formData.companyTargetingBySize.small.exclusionRoles));
    multipartFormData.append('company_size_medium_exclusion_roles', JSON.stringify(formData.companyTargetingBySize.medium.exclusionRoles));
    multipartFormData.append('company_size_large_exclusion_roles', JSON.stringify(formData.companyTargetingBySize.large.exclusionRoles));
    multipartFormData.append('company_size_enterprise_exclusion_roles', JSON.stringify(formData.companyTargetingBySize.enterprise.exclusionRoles));
    
    // Add target departments by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_target_departments', JSON.stringify(formData.companyTargetingBySize.verySmall.targetDepartments));
    multipartFormData.append('company_size_small_target_departments', JSON.stringify(formData.companyTargetingBySize.small.targetDepartments));
    multipartFormData.append('company_size_medium_target_departments', JSON.stringify(formData.companyTargetingBySize.medium.targetDepartments));
    multipartFormData.append('company_size_large_target_departments', JSON.stringify(formData.companyTargetingBySize.large.targetDepartments));
    multipartFormData.append('company_size_enterprise_target_departments', JSON.stringify(formData.companyTargetingBySize.enterprise.targetDepartments));
    
    // Add exclusion departments by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_exclusion_departments', JSON.stringify(formData.companyTargetingBySize.verySmall.exclusionDepartments));
    multipartFormData.append('company_size_small_exclusion_departments', JSON.stringify(formData.companyTargetingBySize.small.exclusionDepartments));
    multipartFormData.append('company_size_medium_exclusion_departments', JSON.stringify(formData.companyTargetingBySize.medium.exclusionDepartments));
    multipartFormData.append('company_size_large_exclusion_departments', JSON.stringify(formData.companyTargetingBySize.large.exclusionDepartments));
    multipartFormData.append('company_size_enterprise_exclusion_departments', JSON.stringify(formData.companyTargetingBySize.enterprise.exclusionDepartments));
    
    // Add timing settings
    multipartFormData.append('days_between_contacts', formData.timingSettings.daysBetweenContacts.toString());
    multipartFormData.append('follow_up_cycle_days', formData.timingSettings.followUpCycleDays.toString());
    
    // Add seniority tier fields (stringify arrays)
    multipartFormData.append('seniority_tier_1', JSON.stringify(formData.seniority_tier_1));
    multipartFormData.append('seniority_tier_2', JSON.stringify(formData.seniority_tier_2));
    multipartFormData.append('seniority_tier_3', JSON.stringify(formData.seniority_tier_3));
    multipartFormData.append('seniority_excluded', JSON.stringify(formData.seniority_excluded));
    
    return multipartFormData;
  }
}

export default ProjectService.getInstance();