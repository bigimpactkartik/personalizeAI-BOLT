import React from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import { DownloadProgress } from '../../services/downloadService';

interface DownloadButtonProps {
  isDownloading: boolean;
  progress?: DownloadProgress | null;
  error?: string | null;
  onDownload: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  isDownloading,
  progress,
  error,
  onDownload,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'primary',
  children = 'Download'
}) => {
  const getButtonContent = () => {
    if (error) {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Retry Download
        </>
      );
    }

    if (isDownloading) {
      if (progress && progress.percentage > 0) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Downloading... {progress.percentage}%
          </>
        );
      }
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing Download...
        </>
      );
    }

    return (
      <>
        <Download className="mr-2 h-4 w-4" />
        {children}
      </>
    );
  };

  const getButtonVariant = () => {
    if (error) return 'outline';
    return variant;
  };

  return (
    <div className="relative">
      <Button
        onClick={onDownload}
        disabled={disabled || isDownloading}
        variant={getButtonVariant()}
        size={size}
        className={`transition-all duration-200 ${className} ${
          error ? 'border-red-300 text-red-700 hover:bg-red-50' : ''
        }`}
      >
        {getButtonContent()}
      </Button>
      
      {/* Progress Bar */}
      {isDownloading && progress && progress.percentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default DownloadButton;