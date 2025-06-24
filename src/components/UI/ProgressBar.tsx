import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'primary' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  size = 'md',
  color = 'primary'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colorClasses = {
    blue: 'bg-gradient-to-r from-primary-500 to-primary-600',
    primary: 'bg-gradient-to-r from-primary-500 to-accent-600',
    green: 'bg-gradient-to-r from-success-500 to-success-600',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    yellow: 'bg-gradient-to-r from-warning-500 to-warning-600',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
    red: 'bg-gradient-to-r from-error-500 to-error-600',
    error: 'bg-gradient-to-r from-error-500 to-error-600'
  };

  return (
    <div className={`w-full bg-neural-200 rounded-full ${sizeClasses[size]} ${className} overflow-hidden`}>
      <div
        className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out shadow-sm`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;