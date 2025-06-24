import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white focus:ring-primary-500 shadow-lg hover:shadow-xl ai-button-glow',
    secondary: 'bg-gradient-to-r from-neural-100 to-neural-200 hover:from-neural-200 hover:to-neural-300 text-neural-700 focus:ring-neural-500 shadow-md hover:shadow-lg border border-neural-300',
    outline: 'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500 backdrop-blur-sm',
    ghost: 'text-neural-700 hover:bg-neural-100/50 focus:ring-neural-500 backdrop-blur-sm'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed transform-none' : ''
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;