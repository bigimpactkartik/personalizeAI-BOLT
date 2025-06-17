import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      hover ? 'hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 hover:-translate-y-1' : ''
    } ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;