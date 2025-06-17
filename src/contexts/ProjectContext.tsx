import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from '../types';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
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
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Tech Startup Outreach',
      description: 'Targeting SaaS companies for lead generation',
      status: 'completed',
      progress: 100,
      createdAt: '2024-01-15',
      resultFile: 'tech-startup-results.xlsx'
    },
    {
      id: '2',
      name: 'E-commerce Campaign',
      description: 'Reaching out to e-commerce business owners',
      status: 'processing',
      progress: 65,
      createdAt: '2024-01-18'
    }
  ]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const value: ProjectContextType = {
    projects,
    addProject,
    updateProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};