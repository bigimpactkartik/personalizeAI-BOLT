import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neural-700 mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`ai-input w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${
          error ? 'border-error-500 focus:ring-error-500 bg-error-50/50' : 'bg-white/70'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-error-600 slide-in">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-neural-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;