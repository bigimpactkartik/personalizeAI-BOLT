import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  label,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onRatingChange(starValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onRatingChange(starValue);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            disabled={disabled}
            className={`
              p-1 rounded-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
            `}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={`
                h-6 w-6 transition-all duration-200
                ${star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-300'
                }
                ${disabled ? '' : 'hover:scale-110'}
              `}
            />
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Not rated'}
        </span>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 slide-in">{error}</p>
      )}
    </div>
  );
};

export default StarRating;