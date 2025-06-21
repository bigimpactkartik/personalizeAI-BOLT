import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${checked 
              ? 'bg-blue-600 border-blue-600' 
              : 'bg-white border-gray-300 hover:border-gray-400'
            }
            ${disabled ? '' : 'hover:shadow-sm'}
          `}
        >
          {checked && (
            <Check className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
      <span className="text-sm text-gray-700 select-none">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;