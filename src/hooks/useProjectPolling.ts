import { useState, useEffect, useRef } from 'react';
import projectService, { ProjectResponse } from '../services/projectService';

interface UseProjectPollingOptions {
  projectId: string;
  enabled: boolean;
  interval?: number;
}

export const useProjectPolling = ({ 
  projectId, 
  enabled, 
  interval = 60000 
}: UseProjectPollingOptions) => {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLogs, setNewLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLogsRef = useRef<string[]>([]);

  const fetchProject = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const projectData = await projectService.getProjectById(projectId);
      
      // Detect new logs for animation
      if (project && projectData.logs.length > project.logs.length) {
        const newLogEntries = projectData.logs.slice(project.logs.length);
        setNewLogs(newLogEntries);
        
        // Clear new logs after animation
        setTimeout(() => setNewLogs([]), 1000);
      }
      
      setProject(projectData);
      previousLogsRef.current = projectData.logs;
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !projectId) return;

    // Initial fetch
    fetchProject();

    // Set up polling for ONGOING projects
    if (enabled) {
      intervalRef.current = setInterval(() => {
        fetchProject(false); // Don't show loading for polling updates
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId, enabled, interval]);

  // Stop polling when project is completed
  useEffect(() => {
    if (project?.status === 'COMPLETED' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [project?.status]);

  return {
    project,
    loading,
    error,
    newLogs,
    refetch: () => fetchProject()
  };
};