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
    <div className={`ai-card-gradient rounded-xl shadow-lg border border-neural-200/50 transition-all duration-300 neural-pattern ${
      hover ? 'hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 card-transition' : ''
    } ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;