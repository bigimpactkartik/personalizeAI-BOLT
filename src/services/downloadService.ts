import apiClient from './api';

export interface DownloadOptions {
  projectId: string;
  projectName: string;
  downloadUrl?: string;
}

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class DownloadService {
  private static instance: DownloadService;

  public static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  /**
   * Download file from URL with progress tracking
   */
  async downloadFromUrl(
    url: string, 
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    try {
      // Validate URL
      if (!url || !this.isValidUrl(url)) {
        throw new Error('Invalid download URL provided');
      }

      // Create a fetch request with progress tracking
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Check if response has content
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (total === 0) {
        throw new Error('File appears to be empty or content-length not provided');
      }

      // Verify content type
      const contentType = response.headers.get('content-type');
      if (contentType && !this.isValidFileType(contentType)) {
        throw new Error(`Invalid file type: ${contentType}. Expected Excel file.`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          chunks.push(value);
          loaded += value.length;
          
          if (onProgress && total > 0) {
            onProgress({
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            });
          }
        }
      }

      // Combine chunks into blob
      const blob = new Blob(chunks, { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Verify blob size
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Trigger download
      this.triggerDownload(blob, filename);

    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(error.message || 'Download failed');
    }
  }

  /**
   * Download project sheet using API endpoint
   */
  async downloadProjectSheet(
    projectId: string, 
    projectName: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await apiClient.get(`/project/${projectId}/download`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage
            });
          }
        }
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const filename = `${this.sanitizeFilename(projectName)}_results.xlsx`;
      this.triggerDownload(response.data, filename);

    } catch (error: any) {
      console.error('Project sheet download error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to download project sheet');
    }
  }

  /**
   * Download using response_sheet_link from project data
   */
  async downloadFromResponseLink(
    responseSheetLink: string,
    projectName: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    try {
      if (!responseSheetLink) {
        throw new Error('No download link available for this project');
      }

      const filename = `${this.sanitizeFilename(projectName)}_results.xlsx`;
      await this.downloadFromUrl(responseSheetLink, filename, onProgress);

    } catch (error: any) {
      console.error('Response link download error:', error);
      throw error;
    }
  }

  /**
   * Trigger browser download
   */
  private triggerDownload(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Error triggering download:', error);
      throw new Error('Failed to initiate download');
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate file type for Excel files
   */
  private isValidFileType(contentType: string): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream', // Generic binary
      'text/csv' // CSV files
    ];
    
    return validTypes.some(type => contentType.includes(type));
  }

  /**
   * Sanitize filename for download
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  /**
   * Check if browser supports downloads
   */
  public isDownloadSupported(): boolean {
    return typeof window !== 'undefined' && 
           'URL' in window && 
           'createObjectURL' in window.URL;
  }
}

export default DownloadService.getInstance();