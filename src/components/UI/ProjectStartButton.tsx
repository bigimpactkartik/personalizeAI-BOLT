import React, { useState } from 'react';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

interface ProjectStartButtonProps {
  projectId: string;
  projectName: string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
  disabled?: boolean;
}

const ProjectStartButton: React.FC<ProjectStartButtonProps> = ({
  projectId,
  projectName,
  status,
  onStatusChange,
  className = '',
  disabled = false
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartProject = async () => {
    try {
      setIsStarting(true);
      setError(null);

      // Get stored user and API keys from localStorage or context
      const storedUser = localStorage.getItem('auth_user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // For now, we'll use placeholder API keys since they're required by the endpoint
      // In a real implementation, these would come from the project settings or user preferences
      const requestData = {
        project_id: projectId,
        original_sheet_url: '', // This would come from the project data
        proceed_on_invalid_email: true,
        openai_key: 'placeholder_openai_key', // Would be retrieved from secure storage
        ss_masters_key: 'placeholder_ss_masters_key', // Would be retrieved from secure storage
        exa_api_key: 'placeholder_exa_api_key' // Would be retrieved from secure storage
      };

      const response = await fetch('https://personalize-ai-v1.onrender.com/personalized-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start project processing');
      }

      const result = await response.json();
      
      // Update status to processing
      onStatusChange?.('ONGOING');
      
      // Show success message briefly
      setTimeout(() => {
        setIsStarting(false);
      }, 1000);

    } catch (err: any) {
      console.error('Error starting project:', err);
      setError(err.message || 'Failed to start project');
      setIsStarting(false);
    }
  };

  const getButtonContent = () => {
    const statusUpper = (status || '').toUpperCase();
    
    if (isStarting) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting...
        </>
      );
    }

    if (error) {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Retry Start
        </>
      );
    }

    switch (statusUpper) {
      case 'ONGOING':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        );
      case 'COMPLETED':
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </>
        );
      case 'FAILED':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start
          </>
        );
    }
  };

  const getButtonVariant = () => {
    const statusUpper = (status || '').toUpperCase();
    
    if (error) return 'outline';
    
    switch (statusUpper) {
      case 'ONGOING':
        return 'secondary';
      case 'COMPLETED':
        return 'secondary';
      case 'FAILED':
        return 'outline';
      default:
        return 'primary';
    }
  };

  const getButtonClassName = () => {
    const statusUpper = (status || '').toUpperCase();
    let classes = 'transition-all duration-300 ';
    
    if (error) {
      classes += 'border-error-300 text-error-700 hover:bg-error-50 ';
    } else {
      switch (statusUpper) {
        case 'ONGOING':
          classes += 'bg-gradient-to-r from-primary-500 to-cyber-500 text-white cursor-not-allowed ';
          break;
        case 'COMPLETED':
          classes += 'bg-gradient-to-r from-success-500 to-success-600 text-white cursor-not-allowed ';
          break;
        case 'FAILED':
          classes += 'border-error-300 text-error-700 hover:bg-error-50 ';
          break;
        default:
          classes += 'shadow-lg hover:shadow-xl ai-button-glow ';
      }
    }
    
    return classes + className;
  };

  const isButtonDisabled = () => {
    const statusUpper = (status || '').toUpperCase();
    return disabled || 
           isStarting || 
           statusUpper === 'ONGOING' || 
           statusUpper === 'COMPLETED';
  };

  return (
    <div className="relative">
      <Button
        onClick={handleStartProject}
        disabled={isButtonDisabled()}
        variant={getButtonVariant()}
        size="sm"
        className={getButtonClassName()}
        aria-label={`${isStarting ? 'Starting' : 'Start'} project ${projectName}`}
        aria-describedby={error ? `error-${projectId}` : undefined}
      >
        {getButtonContent()}
      </Button>
      
      {/* Error Tooltip */}
      {error && (
        <div 
          id={`error-${projectId}`}
          className="absolute top-full left-0 right-0 mt-1 p-2 bg-error-50 border border-error-200 rounded text-xs text-error-600 z-10 slide-in"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ProjectStartButton;