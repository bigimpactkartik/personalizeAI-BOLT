import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Project, ProjectFormData } from '../types';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
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

// Mock projects data
const mockProjects: Project[] = [
  {
    id: '1',
    userId: '1',
    projectName: 'Tech Startup Outreach Q1 2024',
    description: 'Targeting early-stage tech startups for our SaaS platform. Focus on founders and CTOs who might need our development tools.',
    targetAudience: 'Tech startup founders, CTOs, and technical decision makers',
    dataSource: 'excel',
    aiModelProvider: 'openai-gpt4',
    emailCapacity: {
      mailboxes: 5,
      emailsPerMailbox: 100,
      batchDuration: 14,
      emailsPerContact: 3,
      processValidEmails: true
    },
    companyTargeting: [
      {
        companySize: '1-50',
        numberOfContacts: 4,
        primaryTargetRoles: 'CEO, Founder, CTO',
        secondaryTargetRoles: 'VP Engineering, Head of Product',
        exclusionRoles: 'Intern, Junior',
        targetDepartments: 'Engineering, Product',
        exclusionDepartments: 'HR, Finance'
      }
    ],
    status: 'completed',
    progress: 100,
    resultFilePath: '/results/project-1-results.xlsx',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z'
  },
  {
    id: '2',
    userId: '1',
    projectName: 'E-commerce Platform Outreach',
    description: 'Reaching out to e-commerce businesses to promote our analytics and optimization tools.',
    targetAudience: 'E-commerce managers, digital marketing directors, and online store owners',
    dataSource: 'googlesheet',
    googleSheetLink: 'https://docs.google.com/spreadsheets/d/example',
    aiModelProvider: 'claude-sonnet',
    emailCapacity: {
      mailboxes: 3,
      emailsPerMailbox: 75,
      batchDuration: 10,
      emailsPerContact: 2,
      processValidEmails: true
    },
    companyTargeting: [
      {
        companySize: '10-100',
        numberOfContacts: 3,
        primaryTargetRoles: 'Marketing Director, E-commerce Manager',
        secondaryTargetRoles: 'Digital Marketing Specialist, Store Manager',
        exclusionRoles: 'Assistant, Coordinator',
        targetDepartments: 'Marketing, E-commerce',
        exclusionDepartments: 'Legal, Accounting'
      }
    ],
    status: 'processing',
    progress: 65,
    createdAt: '2024-01-22T09:15:00Z',
    updatedAt: '2024-01-25T11:20:00Z'
  },
  {
    id: '3',
    userId: '1',
    projectName: 'Healthcare SaaS Outreach',
    description: 'Targeting healthcare organizations for our patient management software solution.',
    targetAudience: 'Healthcare administrators, practice managers, and medical directors',
    dataSource: 'excel',
    aiModelProvider: 'gemini-pro',
    emailCapacity: {
      mailboxes: 2,
      emailsPerMailbox: 50,
      batchDuration: 7,
      emailsPerContact: 1,
      processValidEmails: true
    },
    companyTargeting: [
      {
        companySize: '20-200',
        numberOfContacts: 5,
        primaryTargetRoles: 'Practice Manager, Medical Director',
        secondaryTargetRoles: 'Administrator, Operations Manager',
        exclusionRoles: 'Nurse, Technician',
        targetDepartments: 'Administration, Operations',
        exclusionDepartments: 'Clinical, Nursing'
      }
    ],
    status: 'pending',
    progress: 0,
    createdAt: '2024-01-28T14:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z'
  }
];

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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get projects from localStorage or use mock data
    const storedProjects = localStorage.getItem(`projects_${user.id}`);
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (error) {
        console.error('Error parsing stored projects:', error);
        setProjects(mockProjects.filter(p => p.userId === user.id));
      }
    } else {
      // Use mock data for demo
      setProjects(mockProjects.filter(p => p.userId === user.id));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    if (user) {
      localStorage.setItem(`projects_${user.id}`, JSON.stringify(updatedProjects));
    }
  };

  const addProject = async (projectData: ProjectFormData): Promise<Project> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProject: Project = {
      id: Date.now().toString(),
      userId: user.id,
      projectName: projectData.projectName,
      description: projectData.description,
      targetAudience: projectData.targetAudience,
      dataSource: projectData.dataSource,
      googleSheetLink: projectData.googleSheetLink,
      excelFile: projectData.excelFile,
      aiModelProvider: projectData.aiModel.provider,
      emailCapacity: projectData.emailCapacity,
      companyTargeting: projectData.companyTargeting,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedProjects = projects.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const deleteProject = async (id: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
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
    refreshProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};