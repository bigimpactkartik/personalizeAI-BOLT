import apiClient from './api';
import { ProjectFormData } from '../types';

export interface ProjectCreateRequest {
  name: string;
  user_id: string;
  description: string | null;
  sheet_link: string | null;
  no_of_mailbox: number;
  emails_per_mailbox: number;
  email_per_contact: number;
  batch_duration_days: number;
  
  // Required API Keys
  openai_key: string;
  ss_masters_key: string;
  exa_api_key: string;
  
  // Prompt fields - send empty string or null if not provided
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
  
  // Primary target roles by company size - send null if not provided
  company_size_very_small_primary_target_roles: string[] | null;
  company_size_small_primary_target_roles: string[] | null;
  company_size_medium_primary_target_roles: string[] | null;
  company_size_large_primary_target_roles: string[] | null;
  company_size_enterprise_primary_target_roles: string[] | null;
  
  // Secondary target roles by company size - send null if not provided
  company_size_very_small_secondary_target_roles: string[] | null;
  company_size_small_secondary_target_roles: string[] | null;
  company_size_medium_secondary_target_roles: string[] | null;
  company_size_large_secondary_target_roles: string[] | null;
  company_size_enterprise_secondary_target_roles: string[] | null;
  
  // Exclusion roles by company size - send null if not provided
  company_size_very_small_exclusion_roles: string[] | null;
  company_size_small_exclusion_roles: string[] | null;
  company_size_medium_exclusion_roles: string[] | null;
  company_size_large_exclusion_roles: string[] | null;
  company_size_enterprise_exclusion_roles: string[] | null;
  
  // Target departments by company size - send null if not provided
  company_size_very_small_target_departments: string[] | null;
  company_size_small_target_departments: string[] | null;
  company_size_medium_target_departments: string[] | null;
  company_size_large_target_departments: string[] | null;
  company_size_enterprise_target_departments: string[] | null;
  
  // Exclusion departments by company size - send null if not provided
  company_size_very_small_exclusion_departments: string[] | null;
  company_size_small_exclusion_departments: string[] | null;
  company_size_medium_exclusion_departments: string[] | null;
  company_size_large_exclusion_departments: string[] | null;
  company_size_enterprise_exclusion_departments: string[] | null;
  
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
  
  // API Keys stored in project
  openai_key: string;
  ss_masters_key: string;
  exa_api_key: string;
  
  // Prompts
  custom_prompt_for_exa_company_information_extraction: string;
  icebreaker_personalized_system_prompt: string;
  icebreaker_personalized_user_prompt: string;
  
  // Contact limits
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
  
  // Timing settings
  days_between_contacts: number;
  follow_up_cycle_days: number;
  
  // Status and progress
  status: string;
  logs: string[];
  row_completed: number;
  total_row: number;
  project_summary?: any;
}

export interface StartProjectRequest {
  project_id: string;
  proceed_on_invalid_email: boolean;
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

  async startProject(projectId: string): Promise<StartProjectResponse> {
    try {
      const requestData: StartProjectRequest = {
        project_id: projectId,
        proceed_on_invalid_email: false // Process only valid emails by default
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
    // Helper function to check if array has meaningful values
    const hasValues = (arr: string[] | undefined): boolean => {
      return arr !== undefined && arr.length > 0 && arr.some(item => item.trim() !== '');
    };

    // Helper function to clean array or return null
    const cleanArrayOrNull = (arr: string[] | undefined): string[] | null => {
      if (!hasValues(arr)) return null;
      return arr!.filter(item => item.trim() !== '');
    };

    return {
      // Basic project info
      name: formData.projectName,
      user_id: userId,
      description: formData.description?.trim() || null,
      sheet_link: formData.dataSource === 'googlesheet' ? (formData.googleSheetLink?.trim() || null) : null,
      
      // Email capacity settings
      no_of_mailbox: formData.emailCapacity.mailboxes,
      emails_per_mailbox: formData.emailCapacity.emailsPerMailbox,
      email_per_contact: formData.emailCapacity.emailsPerContact,
      batch_duration_days: formData.emailCapacity.batchDuration,
      
      // Required API Keys
      openai_key: formData.aiModel.openaiKey?.trim() || '',
      exa_api_key: formData.aiModel.exaKey?.trim() || '',
      ss_masters_key: formData.aiModel.ssmKey?.trim() || '',
      
      // Prompt fields - send empty string if not provided by user
      custom_prompt_for_exa_company_information_extraction: formData.prompts?.customPromptForExaCompanyInformationExtraction?.trim() || '',
      icebreaker_personalized_system_prompt: formData.prompts?.icebreakerPersonalizedSystemPrompt?.trim() || '',
      icebreaker_personalized_user_prompt: formData.prompts?.icebreakerPersonalizedUserPrompt?.trim() || '',
      
      // Contact limits
      contact_limit_very_small: formData.contactLimits?.verySmall || 2,
      contact_limit_small_company: formData.contactLimits?.smallCompany || 4,
      contact_limit_medium_company: formData.contactLimits?.mediumCompany || 8,
      contact_limit_large_company: formData.contactLimits?.largeCompany || 10,
      contact_limit_enterprise: formData.contactLimits?.enterprise || 0,
      
      // Company size thresholds
      company_size_very_small_max: formData.companySizeLimits?.verySmallMax || 10,
      company_size_small_max: formData.companySizeLimits?.smallMax || 50,
      company_size_medium_max: formData.companySizeLimits?.mediumMax || 200,
      company_size_large_max: formData.companySizeLimits?.largeMax || 1000,
      company_size_enterprise_min: formData.companySizeLimits?.enterpriseMin || 1001,
      
      // Primary target roles by company size - send null if not provided by user
      company_size_very_small_primary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.primaryTargetRoles),
      company_size_small_primary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.small?.primaryTargetRoles),
      company_size_medium_primary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.medium?.primaryTargetRoles),
      company_size_large_primary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.large?.primaryTargetRoles),
      company_size_enterprise_primary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.primaryTargetRoles),
      
      // Secondary target roles by company size - send null if not provided by user
      company_size_very_small_secondary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.secondaryTargetRoles),
      company_size_small_secondary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.small?.secondaryTargetRoles),
      company_size_medium_secondary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.medium?.secondaryTargetRoles),
      company_size_large_secondary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.large?.secondaryTargetRoles),
      company_size_enterprise_secondary_target_roles: cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.secondaryTargetRoles),
      
      // Exclusion roles by company size - send null if not provided by user
      company_size_very_small_exclusion_roles: cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.exclusionRoles),
      company_size_small_exclusion_roles: cleanArrayOrNull(formData.companyTargetingBySize?.small?.exclusionRoles),
      company_size_medium_exclusion_roles: cleanArrayOrNull(formData.companyTargetingBySize?.medium?.exclusionRoles),
      company_size_large_exclusion_roles: cleanArrayOrNull(formData.companyTargetingBySize?.large?.exclusionRoles),
      company_size_enterprise_exclusion_roles: cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.exclusionRoles),
      
      // Target departments by company size - send null if not provided by user
      company_size_very_small_target_departments: cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.targetDepartments),
      company_size_small_target_departments: cleanArrayOrNull(formData.companyTargetingBySize?.small?.targetDepartments),
      company_size_medium_target_departments: cleanArrayOrNull(formData.companyTargetingBySize?.medium?.targetDepartments),
      company_size_large_target_departments: cleanArrayOrNull(formData.companyTargetingBySize?.large?.targetDepartments),
      company_size_enterprise_target_departments: cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.targetDepartments),
      
      // Exclusion departments by company size - send null if not provided by user
      company_size_very_small_exclusion_departments: cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.exclusionDepartments),
      company_size_small_exclusion_departments: cleanArrayOrNull(formData.companyTargetingBySize?.small?.exclusionDepartments),
      company_size_medium_exclusion_departments: cleanArrayOrNull(formData.companyTargetingBySize?.medium?.exclusionDepartments),
      company_size_large_exclusion_departments: cleanArrayOrNull(formData.companyTargetingBySize?.large?.exclusionDepartments),
      company_size_enterprise_exclusion_departments: cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.exclusionDepartments),
      
      // Timing settings
      days_between_contacts: formData.timingSettings?.daysBetweenContacts || 3,
      follow_up_cycle_days: formData.timingSettings?.followUpCycleDays || 7
    };
  }

  private transformFormDataToFlatRequestForMultipart(formData: ProjectFormData, userId: string): FormData {
    const multipartFormData = new FormData();
    
    // Add the Excel file
    if (formData.excelFile) {
      multipartFormData.append('file', formData.excelFile);
    }
    
    // Helper function to check if array has meaningful values
    const hasValues = (arr: string[] | undefined): boolean => {
      return arr !== undefined && arr.length > 0 && arr.some(item => item.trim() !== '');
    };

    // Helper function to clean array or return null
    const cleanArrayOrNull = (arr: string[] | undefined): string[] | null => {
      if (!hasValues(arr)) return null;
      return arr!.filter(item => item.trim() !== '');
    };
    
    // Add basic project information
    multipartFormData.append('name', formData.projectName);
    multipartFormData.append('user_id', userId);
    
    // Add description only if provided
    if (formData.description?.trim()) {
      multipartFormData.append('description', formData.description.trim());
    } else {
      multipartFormData.append('description', '');
    }
    
    // Add required API Keys
    multipartFormData.append('openai_key', formData.aiModel.openaiKey?.trim() || '');
    multipartFormData.append('exa_api_key', formData.aiModel.exaKey?.trim() || '');
    multipartFormData.append('ss_masters_key', formData.aiModel.ssmKey?.trim() || '');
    
    // Add email capacity settings
    multipartFormData.append('no_of_mailbox', formData.emailCapacity.mailboxes.toString());
    multipartFormData.append('emails_per_mailbox', formData.emailCapacity.emailsPerMailbox.toString());
    multipartFormData.append('email_per_contact', formData.emailCapacity.emailsPerContact.toString());
    multipartFormData.append('batch_duration_days', formData.emailCapacity.batchDuration.toString());
    
    // Add prompt fields - send empty string if not provided by user
    multipartFormData.append('custom_prompt_for_exa_company_information_extraction', 
      formData.prompts?.customPromptForExaCompanyInformationExtraction?.trim() || '');
    multipartFormData.append('icebreaker_personalized_system_prompt', 
      formData.prompts?.icebreakerPersonalizedSystemPrompt?.trim() || '');
    multipartFormData.append('icebreaker_personalized_user_prompt', 
      formData.prompts?.icebreakerPersonalizedUserPrompt?.trim() || '');
    
    // Add contact limits
    multipartFormData.append('contact_limit_very_small', (formData.contactLimits?.verySmall || 2).toString());
    multipartFormData.append('contact_limit_small_company', (formData.contactLimits?.smallCompany || 4).toString());
    multipartFormData.append('contact_limit_medium_company', (formData.contactLimits?.mediumCompany || 8).toString());
    multipartFormData.append('contact_limit_large_company', (formData.contactLimits?.largeCompany || 10).toString());
    multipartFormData.append('contact_limit_enterprise', (formData.contactLimits?.enterprise || 0).toString());
    
    // Add company size thresholds
    multipartFormData.append('company_size_very_small_max', (formData.companySizeLimits?.verySmallMax || 10).toString());
    multipartFormData.append('company_size_small_max', (formData.companySizeLimits?.smallMax || 50).toString());
    multipartFormData.append('company_size_medium_max', (formData.companySizeLimits?.mediumMax || 200).toString());
    multipartFormData.append('company_size_large_max', (formData.companySizeLimits?.largeMax || 1000).toString());
    multipartFormData.append('company_size_enterprise_min', (formData.companySizeLimits?.enterpriseMin || 1001).toString());
    
    // Add primary target roles by company size - send null if not provided by user
    const verySmallPrimary = cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.primaryTargetRoles);
    multipartFormData.append('company_size_very_small_primary_target_roles', 
      verySmallPrimary ? JSON.stringify(verySmallPrimary) : 'null');
    
    const smallPrimary = cleanArrayOrNull(formData.companyTargetingBySize?.small?.primaryTargetRoles);
    multipartFormData.append('company_size_small_primary_target_roles', 
      smallPrimary ? JSON.stringify(smallPrimary) : 'null');
    
    const mediumPrimary = cleanArrayOrNull(formData.companyTargetingBySize?.medium?.primaryTargetRoles);
    multipartFormData.append('company_size_medium_primary_target_roles', 
      mediumPrimary ? JSON.stringify(mediumPrimary) : 'null');
    
    const largePrimary = cleanArrayOrNull(formData.companyTargetingBySize?.large?.primaryTargetRoles);
    multipartFormData.append('company_size_large_primary_target_roles', 
      largePrimary ? JSON.stringify(largePrimary) : 'null');
    
    const enterprisePrimary = cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.primaryTargetRoles);
    multipartFormData.append('company_size_enterprise_primary_target_roles', 
      enterprisePrimary ? JSON.stringify(enterprisePrimary) : 'null');
    
    // Add secondary target roles by company size - send null if not provided by user
    const verySmallSecondary = cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.secondaryTargetRoles);
    multipartFormData.append('company_size_very_small_secondary_target_roles', 
      verySmallSecondary ? JSON.stringify(verySmallSecondary) : 'null');
    
    const smallSecondary = cleanArrayOrNull(formData.companyTargetingBySize?.small?.secondaryTargetRoles);
    multipartFormData.append('company_size_small_secondary_target_roles', 
      smallSecondary ? JSON.stringify(smallSecondary) : 'null');
    
    const mediumSecondary = cleanArrayOrNull(formData.companyTargetingBySize?.medium?.secondaryTargetRoles);
    multipartFormData.append('company_size_medium_secondary_target_roles', 
      mediumSecondary ? JSON.stringify(mediumSecondary) : 'null');
    
    const largeSecondary = cleanArrayOrNull(formData.companyTargetingBySize?.large?.secondaryTargetRoles);
    multipartFormData.append('company_size_large_secondary_target_roles', 
      largeSecondary ? JSON.stringify(largeSecondary) : 'null');
    
    const enterpriseSecondary = cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.secondaryTargetRoles);
    multipartFormData.append('company_size_enterprise_secondary_target_roles', 
      enterpriseSecondary ? JSON.stringify(enterpriseSecondary) : 'null');
    
    // Add exclusion roles by company size - send null if not provided by user
    const verySmallExclusion = cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.exclusionRoles);
    multipartFormData.append('company_size_very_small_exclusion_roles', 
      verySmallExclusion ? JSON.stringify(verySmallExclusion) : 'null');
    
    const smallExclusion = cleanArrayOrNull(formData.companyTargetingBySize?.small?.exclusionRoles);
    multipartFormData.append('company_size_small_exclusion_roles', 
      smallExclusion ? JSON.stringify(smallExclusion) : 'null');
    
    const mediumExclusion = cleanArrayOrNull(formData.companyTargetingBySize?.medium?.exclusionRoles);
    multipartFormData.append('company_size_medium_exclusion_roles', 
      mediumExclusion ? JSON.stringify(mediumExclusion) : 'null');
    
    const largeExclusion = cleanArrayOrNull(formData.companyTargetingBySize?.large?.exclusionRoles);
    multipartFormData.append('company_size_large_exclusion_roles', 
      largeExclusion ? JSON.stringify(largeExclusion) : 'null');
    
    const enterpriseExclusion = cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.exclusionRoles);
    multipartFormData.append('company_size_enterprise_exclusion_roles', 
      enterpriseExclusion ? JSON.stringify(enterpriseExclusion) : 'null');
    
    // Add target departments by company size - send null if not provided by user
    const verySmallTargetDepts = cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.targetDepartments);
    multipartFormData.append('company_size_very_small_target_departments', 
      verySmallTargetDepts ? JSON.stringify(verySmallTargetDepts) : 'null');
    
    const smallTargetDepts = cleanArrayOrNull(formData.companyTargetingBySize?.small?.targetDepartments);
    multipartFormData.append('company_size_small_target_departments', 
      smallTargetDepts ? JSON.stringify(smallTargetDepts) : 'null');
    
    const mediumTargetDepts = cleanArrayOrNull(formData.companyTargetingBySize?.medium?.targetDepartments);
    multipartFormData.append('company_size_medium_target_departments', 
      mediumTargetDepts ? JSON.stringify(mediumTargetDepts) : 'null');
    
    const largeTargetDepts = cleanArrayOrNull(formData.companyTargetingBySize?.large?.targetDepartments);
    multipartFormData.append('company_size_large_target_departments', 
      largeTargetDepts ? JSON.stringify(largeTargetDepts) : 'null');
    
    const enterpriseTargetDepts = cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.targetDepartments);
    multipartFormData.append('company_size_enterprise_target_departments', 
      enterpriseTargetDepts ? JSON.stringify(enterpriseTargetDepts) : 'null');
    
    // Add exclusion departments by company size - send null if not provided by user
    const verySmallExclusionDepts = cleanArrayOrNull(formData.companyTargetingBySize?.verySmall?.exclusionDepartments);
    multipartFormData.append('company_size_very_small_exclusion_departments', 
      verySmallExclusionDepts ? JSON.stringify(verySmallExclusionDepts) : 'null');
    
    const smallExclusionDepts = cleanArrayOrNull(formData.companyTargetingBySize?.small?.exclusionDepartments);
    multipartFormData.append('company_size_small_exclusion_departments', 
      smallExclusionDepts ? JSON.stringify(smallExclusionDepts) : 'null');
    
    const mediumExclusionDepts = cleanArrayOrNull(formData.companyTargetingBySize?.medium?.exclusionDepartments);
    multipartFormData.append('company_size_medium_exclusion_departments', 
      mediumExclusionDepts ? JSON.stringify(mediumExclusionDepts) : 'null');
    
    const largeExclusionDepts = cleanArrayOrNull(formData.companyTargetingBySize?.large?.exclusionDepartments);
    multipartFormData.append('company_size_large_exclusion_departments', 
      largeExclusionDepts ? JSON.stringify(largeExclusionDepts) : 'null');
    
    const enterpriseExclusionDepts = cleanArrayOrNull(formData.companyTargetingBySize?.enterprise?.exclusionDepartments);
    multipartFormData.append('company_size_enterprise_exclusion_departments', 
      enterpriseExclusionDepts ? JSON.stringify(enterpriseExclusionDepts) : 'null');
    
    // Add timing settings
    multipartFormData.append('days_between_contacts', (formData.timingSettings?.daysBetweenContacts || 3).toString());
    multipartFormData.append('follow_up_cycle_days', (formData.timingSettings?.followUpCycleDays || 7).toString());
    
    return multipartFormData;
  }
}

export default ProjectService.getInstance();