import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  text = 'Loading...',
  size = 'lg',
  fullScreen = true,
  className = ''
}) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen ai-background flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <LoadingSpinner 
          size={size} 
          text={text}
          className="neural-pattern"
        />
      </div>
    </div>
  );
};

export default PageLoader;