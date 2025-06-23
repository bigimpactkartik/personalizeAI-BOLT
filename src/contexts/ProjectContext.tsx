import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import projectService from '../services/projectService';

export interface Project {
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
  advancedSettings?: {
    exaPrompt?: string;
    icebreakerSystemPrompt?: string;
    icebreakerUserPrompt?: string;
  };
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

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (projectData: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  getProject: (id: string) => Promise<Project | null>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchProjects = async () => {
    if (!user?.uuid) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await projectService.getProjects(user.uuid);
      setProjects(fetchedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const addProject = async (projectData: ProjectFormData): Promise<Project> => {
    if (!user?.uuid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newProject = await projectService.createProject(projectData, user.uuid);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setError(null);
      const updatedProjects = projects.map(project => 
        project.id === id 
          ? { ...project, ...updates }
          : project
      );
      setProjects(updatedProjects);
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setError(null);
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
      throw err;
    }
  };

  const getProject = async (id: string): Promise<Project | null> => {
    try {
      setError(null);
      return await projectService.getProject(id);
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project');
      return null;
    }
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
    getProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};