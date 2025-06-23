import { useState, useCallback } from 'react';
import downloadService, { DownloadProgress } from '../services/downloadService';

interface UseDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useDownload = (options: UseDownloadOptions = {}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadFromUrl = useCallback(async (url: string, filename: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      setProgress(null);

      await downloadService.downloadFromUrl(url, filename, (progressData) => {
        setProgress(progressData);
      });

      options.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Download failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  }, [options]);

  const downloadProjectSheet = useCallback(async (projectId: string, projectName: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      setProgress(null);

      await downloadService.downloadProjectSheet(projectId, projectName, (progressData) => {
        setProgress(progressData);
      });

      options.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Download failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  }, [options]);

  const downloadFromResponseLink = useCallback(async (responseSheetLink: string, projectName: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      setProgress(null);

      await downloadService.downloadFromResponseLink(responseSheetLink, projectName, (progressData) => {
        setProgress(progressData);
      });

      options.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Download failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    isDownloading,
    progress,
    error,
    downloadFromUrl,
    downloadProjectSheet,
    downloadFromResponseLink,
    reset
  };
};