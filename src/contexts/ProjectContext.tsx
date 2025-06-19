import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { ProjectFormData } from '../types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  uploadFile: (file: File, userId: string) => Promise<string>;
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
  const { user, isAuthenticated } = useAuth();

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const uploadFile = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    return data.path;
  };

  const addProject = async (projectData: ProjectFormData): Promise<Project> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    let excelFilePath: string | null = null;

    // Upload file if it exists
    if (projectData.excelFile) {
      excelFilePath = await uploadFile(projectData.excelFile, user.id);
    }

    const projectInsert: ProjectInsert = {
      user_id: user.id,
      project_name: projectData.projectName,
      description: projectData.description,
      target_audience: projectData.targetAudience,
      data_source: projectData.dataSource,
      google_sheet_link: projectData.googleSheetLink || null,
      excel_file_path: excelFilePath,
      ai_model_provider: projectData.aiModel.provider,
      email_capacity: projectData.emailCapacity,
      company_targeting: projectData.companyTargeting,
      status: 'pending',
      progress: 0,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectInsert)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProjects(prev => [data, ...prev]);
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProjects(prev => prev.map(project => 
      project.id === id ? data : project
    ));
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  const value: ProjectContextType = {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
    uploadFile
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};