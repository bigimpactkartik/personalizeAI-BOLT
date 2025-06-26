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
  
  // Required API Keys
  openai_key: string;
  ss_masters_key: string;
  exa_api_key: string;
  
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
    // Set default prompts if empty
    const defaultPrompts = {
      customPromptForExaCompanyInformationExtraction: 'Extract comprehensive company information including industry, size, recent news, and key decision makers from the provided data.',
      icebreakerPersonalizedSystemPrompt: 'You are an expert at creating personalized icebreakers for cold emails. Use the provided company and contact information to create engaging, relevant opening lines.',
      icebreakerPersonalizedUserPrompt: 'Create a personalized icebreaker for this contact based on their role, company, and any available information about recent company developments or achievements.'
    };

    return {
      name: formData.projectName,
      user_id: userId,
      description: formData.description || null,
      sheet_link: formData.dataSource === 'googlesheet' ? formData.googleSheetLink || null : null,
      no_of_mailbox: formData.emailCapacity.mailboxes,
      emails_per_mailbox: formData.emailCapacity.emailsPerMailbox,
      email_per_contact: formData.emailCapacity.emailsPerContact,
      batch_duration_days: formData.emailCapacity.batchDuration,
      
      // Required API Keys - must be provided
      openai_key: formData.aiModel.openaiKey?.trim() || '',
      exa_api_key: formData.aiModel.exaKey?.trim() || '',
      ss_masters_key: formData.aiModel.ssmKey?.trim() || '',
      
      // Required prompts with defaults
      custom_prompt_for_exa_company_information_extraction: formData.prompts?.customPromptForExaCompanyInformationExtraction || defaultPrompts.customPromptForExaCompanyInformationExtraction,
      icebreaker_personalized_system_prompt: formData.prompts?.icebreakerPersonalizedSystemPrompt || defaultPrompts.icebreakerPersonalizedSystemPrompt,
      icebreaker_personalized_user_prompt: formData.prompts?.icebreakerPersonalizedUserPrompt || defaultPrompts.icebreakerPersonalizedUserPrompt,
      
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
      
      // Primary target roles by company size
      company_size_very_small_primary_target_roles: formData.companyTargetingBySize?.verySmall?.primaryTargetRoles || ['ceo', 'founder', 'co-founder', 'owner', 'president'],
      company_size_small_primary_target_roles: formData.companyTargetingBySize?.small?.primaryTargetRoles || ['ceo', 'founder', 'co-founder', 'vp', 'vice president'],
      company_size_medium_primary_target_roles: formData.companyTargetingBySize?.medium?.primaryTargetRoles || ['director', 'vp', 'vice president', 'head of'],
      company_size_large_primary_target_roles: formData.companyTargetingBySize?.large?.primaryTargetRoles || ['director', 'head of', 'senior director', 'vp', 'vice president'],
      company_size_enterprise_primary_target_roles: formData.companyTargetingBySize?.enterprise?.primaryTargetRoles || ['ABM Territory'],
      
      // Secondary target roles by company size
      company_size_very_small_secondary_target_roles: formData.companyTargetingBySize?.verySmall?.secondaryTargetRoles || ['director', 'head of', 'vp', 'vice president'],
      company_size_small_secondary_target_roles: formData.companyTargetingBySize?.small?.secondaryTargetRoles || ['director', 'head of', 'senior manager', 'manager'],
      company_size_medium_secondary_target_roles: formData.companyTargetingBySize?.medium?.secondaryTargetRoles || ['senior manager', 'manager', 'senior director'],
      company_size_large_secondary_target_roles: formData.companyTargetingBySize?.large?.secondaryTargetRoles || ['VP', 'Senior Manager'],
      company_size_enterprise_secondary_target_roles: formData.companyTargetingBySize?.enterprise?.secondaryTargetRoles || ['Contact for ABM strategy'],
      
      // Exclusion roles by company size
      company_size_very_small_exclusion_roles: formData.companyTargetingBySize?.verySmall?.exclusionRoles || ['intern', 'assistant', 'coordinator', 'analyst'],
      company_size_small_exclusion_roles: formData.companyTargetingBySize?.small?.exclusionRoles || ['Intern', 'Assistant'],
      company_size_medium_exclusion_roles: formData.companyTargetingBySize?.medium?.exclusionRoles || ['CEO', 'Founder', 'Analyst'],
      company_size_large_exclusion_roles: formData.companyTargetingBySize?.large?.exclusionRoles || ['CEO', 'President', 'Analyst'],
      company_size_enterprise_exclusion_roles: formData.companyTargetingBySize?.enterprise?.exclusionRoles || ['All'],
      
      // Target departments by company size
      company_size_very_small_target_departments: formData.companyTargetingBySize?.verySmall?.targetDepartments || ['All'],
      company_size_small_target_departments: formData.companyTargetingBySize?.small?.targetDepartments || ['All'],
      company_size_medium_target_departments: formData.companyTargetingBySize?.medium?.targetDepartments || ['Sales', 'Marketing', 'Operations', 'Growth'],
      company_size_large_target_departments: formData.companyTargetingBySize?.large?.targetDepartments || ['Sales', 'Marketing', 'Operations', 'Growth'],
      company_size_enterprise_target_departments: formData.companyTargetingBySize?.enterprise?.targetDepartments || ['All'],
      
      // Exclusion departments by company size
      company_size_very_small_exclusion_departments: formData.companyTargetingBySize?.verySmall?.exclusionDepartments || ['None'],
      company_size_small_exclusion_departments: formData.companyTargetingBySize?.small?.exclusionDepartments || ['None'],
      company_size_medium_exclusion_departments: formData.companyTargetingBySize?.medium?.exclusionDepartments || ['HR', 'Legal', 'Finance', 'Accounting'],
      company_size_large_exclusion_departments: formData.companyTargetingBySize?.large?.exclusionDepartments || ['HR', 'Legal', 'Finance', 'Accounting'],
      company_size_enterprise_exclusion_departments: formData.companyTargetingBySize?.enterprise?.exclusionDepartments || ['N/A'],
      
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
    
    // Set default prompts if empty
    const defaultPrompts = {
      customPromptForExaCompanyInformationExtraction: 'Extract comprehensive company information including industry, size, recent news, and key decision makers from the provided data.',
      icebreakerPersonalizedSystemPrompt: 'You are an expert at creating personalized icebreakers for cold emails. Use the provided company and contact information to create engaging, relevant opening lines.',
      icebreakerPersonalizedUserPrompt: 'Create a personalized icebreaker for this contact based on their role, company, and any available information about recent company developments or achievements.'
    };
    
    // Add basic project information
    multipartFormData.append('name', formData.projectName);
    multipartFormData.append('user_id', userId);
    if (formData.description) {
      multipartFormData.append('description', formData.description);
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
    
    // Add required prompts with defaults
    multipartFormData.append('custom_prompt_for_exa_company_information_extraction', 
      formData.prompts?.customPromptForExaCompanyInformationExtraction || defaultPrompts.customPromptForExaCompanyInformationExtraction);
    multipartFormData.append('icebreaker_personalized_system_prompt', 
      formData.prompts?.icebreakerPersonalizedSystemPrompt || defaultPrompts.icebreakerPersonalizedSystemPrompt);
    multipartFormData.append('icebreaker_personalized_user_prompt', 
      formData.prompts?.icebreakerPersonalizedUserPrompt || defaultPrompts.icebreakerPersonalizedUserPrompt);
    
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
    
    // Add primary target roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_primary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.verySmall?.primaryTargetRoles || ['ceo', 'founder', 'co-founder', 'owner', 'president']));
    multipartFormData.append('company_size_small_primary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.small?.primaryTargetRoles || ['ceo', 'founder', 'co-founder', 'vp', 'vice president']));
    multipartFormData.append('company_size_medium_primary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.medium?.primaryTargetRoles || ['director', 'vp', 'vice president', 'head of']));
    multipartFormData.append('company_size_large_primary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.large?.primaryTargetRoles || ['director', 'head of', 'senior director', 'vp', 'vice president']));
    multipartFormData.append('company_size_enterprise_primary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.enterprise?.primaryTargetRoles || ['ABM Territory']));
    
    // Add secondary target roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_secondary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.verySmall?.secondaryTargetRoles || ['director', 'head of', 'vp', 'vice president']));
    multipartFormData.append('company_size_small_secondary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.small?.secondaryTargetRoles || ['director', 'head of', 'senior manager', 'manager']));
    multipartFormData.append('company_size_medium_secondary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.medium?.secondaryTargetRoles || ['senior manager', 'manager', 'senior director']));
    multipartFormData.append('company_size_large_secondary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.large?.secondaryTargetRoles || ['VP', 'Senior Manager']));
    multipartFormData.append('company_size_enterprise_secondary_target_roles', 
      JSON.stringify(formData.companyTargetingBySize?.enterprise?.secondaryTargetRoles || ['Contact for ABM strategy']));
    
    // Add exclusion roles by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_exclusion_roles', 
      JSON.stringify(formData.companyTargetingBySize?.verySmall?.exclusionRoles || ['intern', 'assistant', 'coordinator', 'analyst']));
    multipartFormData.append('company_size_small_exclusion_roles', 
      JSON.stringify(formData.companyTargetingBySize?.small?.exclusionRoles || ['Intern', 'Assistant']));
    multipartFormData.append('company_size_medium_exclusion_roles', 
      JSON.stringify(formData.companyTargetingBySize?.medium?.exclusionRoles || ['CEO', 'Founder', 'Analyst']));
    multipartFormData.append('company_size_large_exclusion_roles', 
      JSON.stringify(formData.companyTargetingBySize?.large?.exclusionRoles || ['CEO', 'President', 'Analyst']));
    multipartFormData.append('company_size_enterprise_exclusion_roles', 
      JSON.stringify(formData.companyTargetingBySize?.enterprise?.exclusionRoles || ['All']));
    
    // Add target departments by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_target_departments', 
      JSON.stringify(formData.companyTargetingBySize?.verySmall?.targetDepartments || ['All']));
    multipartFormData.append('company_size_small_target_departments', 
      JSON.stringify(formData.companyTargetingBySize?.small?.targetDepartments || ['All']));
    multipartFormData.append('company_size_medium_target_departments', 
      JSON.stringify(formData.companyTargetingBySize?.medium?.targetDepartments || ['Sales', 'Marketing', 'Operations', 'Growth']));
    multipartFormData.append('company_size_large_target_departments', 
      JSON.stringify(formData.companyTargetingBySize?.large?.targetDepartments || ['Sales', 'Marketing', 'Operations', 'Growth']));
    multipartFormData.append('company_size_enterprise_target_departments', 
      JSON.stringify(formData.companyTargetingBySize?.enterprise?.targetDepartments || ['All']));
    
    // Add exclusion departments by company size (stringify arrays)
    multipartFormData.append('company_size_very_small_exclusion_departments', 
      JSON.stringify(formData.companyTargetingBySize?.verySmall?.exclusionDepartments || ['None']));
    multipartFormData.append('company_size_small_exclusion_departments', 
      JSON.stringify(formData.companyTargetingBySize?.small?.exclusionDepartments || ['None']));
    multipartFormData.append('company_size_medium_exclusion_departments', 
      JSON.stringify(formData.companyTargetingBySize?.medium?.exclusionDepartments || ['HR', 'Legal', 'Finance', 'Accounting']));
    multipartFormData.append('company_size_large_exclusion_departments', 
      JSON.stringify(formData.companyTargetingBySize?.large?.exclusionDepartments || ['HR', 'Legal', 'Finance', 'Accounting']));
    multipartFormData.append('company_size_enterprise_exclusion_departments', 
      JSON.stringify(formData.companyTargetingBySize?.enterprise?.exclusionDepartments || ['N/A']));
    
    // Add timing settings
    multipartFormData.append('days_between_contacts', (formData.timingSettings?.daysBetweenContacts || 3).toString());
    multipartFormData.append('follow_up_cycle_days', (formData.timingSettings?.followUpCycleDays || 7).toString());
    
    return multipartFormData;
  }
}

export default ProjectService.getInstance();