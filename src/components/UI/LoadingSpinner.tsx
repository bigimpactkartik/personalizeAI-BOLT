import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text = 'Loading...',
  showText = true
}) => {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  useEffect(() => {
    let startTime: number;
    let isAnimating = true;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      if (spinnerRef.current && isAnimating) {
        const elapsed = timestamp - startTime;
        const rotation = (elapsed / 1500) * 360; // 1.5s per rotation
        
        // Use transform3d for hardware acceleration
        spinnerRef.current.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg)`;
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      isAnimating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        ref={spinnerRef}
        className={`${sizeClasses[size]} text-primary-600 neural-glow`}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <Loader2 className="w-full h-full" />
      </div>
      {showText && (
        <p className={`text-neural-600 mt-4 ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;