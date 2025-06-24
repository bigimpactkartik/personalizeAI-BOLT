import { useState, useCallback } from 'react';
import projectStartService from '../services/projectStartService';

interface UseProjectStartOptions {
  onSuccess?: (projectId: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (projectId: string, newStatus: string) => void;
}

export const useProjectStart = (options: UseProjectStartOptions = {}) => {
  const [startingProjects, setStartingProjects] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const startProject = useCallback(async (
    projectId: string,
    sheetUrl: string,
    apiKeys: {
      openaiKey: string;
      ssMastersKey: string;
      exaApiKey: string;
    }
  ) => {
    try {
      // Validate API keys
      const validationErrors = projectStartService.validateApiKeys(apiKeys);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        setErrors(prev => ({ ...prev, [projectId]: errorMessage }));
        options.onError?.(errorMessage);
        return;
      }

      setStartingProjects(prev => new Set(prev).add(projectId));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[projectId];
        return newErrors;
      });

      // Update status to indicate starting
      options.onStatusChange?.(projectId, 'STARTING');

      const response = await projectStartService.startProject(
        projectId,
        sheetUrl,
        apiKeys
      );

      // Update status to ongoing
      options.onStatusChange?.(projectId, 'ONGOING');
      options.onSuccess?.(projectId);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start project';
      setErrors(prev => ({ ...prev, [projectId]: errorMessage }));
      options.onError?.(errorMessage);
      
      // Reset status on error
      options.onStatusChange?.(projectId, 'READY');
    } finally {
      setStartingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  }, [options]);

  const clearError = useCallback((projectId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[projectId];
      return newErrors;
    });
  }, []);

  const isStarting = useCallback((projectId: string) => {
    return startingProjects.has(projectId);
  }, [startingProjects]);

  const getError = useCallback((projectId: string) => {
    return errors[projectId] || null;
  }, [errors]);

  return {
    startProject,
    isStarting,
    getError,
    clearError
  };
};