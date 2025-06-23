import apiClient from './api';
import { ProjectCreate, ProjectResponse } from '../types/project';

class ProjectService {
  private static instance: ProjectService;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async getProjectIds(userId: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/projects/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch project IDs');
    }
  }

  async getProjectDetails(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await apiClient.get(`/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch project details');
    }
  }

  async createProject(projectData: ProjectCreate): Promise<ProjectResponse> {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create project');
    }
  }

  async startProject(projectId: string): Promise<void> {
    try {
      await apiClient.post(`/project/${projectId}/start`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to start project');
    }
  }
}

export default ProjectService.getInstance();