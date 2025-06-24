import apiClient from './api';

export interface ProjectStartRequest {
  project_id: string;
  original_sheet_url: string;
  proceed_on_invalid_email: boolean;
  openai_key: string;
  ss_masters_key: string;
  exa_api_key: string;
}

export interface ProjectStartResponse {
  message: string;
  project_id: string;
}

class ProjectStartService {
  private static instance: ProjectStartService;

  public static getInstance(): ProjectStartService {
    if (!ProjectStartService.instance) {
      ProjectStartService.instance = new ProjectStartService();
    }
    return ProjectStartService.instance;
  }

  async startProject(
    projectId: string,
    sheetUrl: string,
    apiKeys: {
      openaiKey: string;
      ssMastersKey: string;
      exaApiKey: string;
    },
    proceedOnInvalidEmail: boolean = true
  ): Promise<ProjectStartResponse> {
    try {
      const requestData: ProjectStartRequest = {
        project_id: projectId,
        original_sheet_url: sheetUrl,
        proceed_on_invalid_email: proceedOnInvalidEmail,
        openai_key: apiKeys.openaiKey,
        ss_masters_key: apiKeys.ssMastersKey,
        exa_api_key: apiKeys.exaApiKey
      };

      const response = await apiClient.post('/personalized-sheet', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error starting project:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Failed to start project processing'
      );
    }
  }

  async getProjectApiKeys(projectId: string): Promise<{
    openaiKey: string;
    ssMastersKey: string;
    exaApiKey: string;
  } | null> {
    try {
      // This would typically fetch the API keys from the project settings
      // For now, we'll return null to indicate keys need to be provided
      return null;
    } catch (error) {
      console.error('Error fetching project API keys:', error);
      return null;
    }
  }

  validateApiKeys(keys: {
    openaiKey?: string;
    ssMastersKey?: string;
    exaApiKey?: string;
  }): string[] {
    const errors: string[] = [];
    
    if (!keys.openaiKey?.trim()) {
      errors.push('OpenAI API key is required');
    }
    
    if (!keys.ssMastersKey?.trim()) {
      errors.push('SS Masters API key is required');
    }
    
    if (!keys.exaApiKey?.trim()) {
      errors.push('EXA API key is required');
    }
    
    return errors;
  }
}

export default ProjectStartService.getInstance();