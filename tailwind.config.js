/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - AI/Technology focused
        primary: {
          50: '#f0f9ff',   // Very light blue
          100: '#e0f2fe',  // Light blue
          200: '#bae6fd',  // Lighter blue
          300: '#7dd3fc',  // Light blue
          400: '#38bdf8',  // Medium blue
          500: '#0ea5e9',  // Primary blue
          600: '#0284c7',  // Darker blue
          700: '#0369a1',  // Dark blue
          800: '#075985',  // Very dark blue
          900: '#0c4a6e',  // Deepest blue
          950: '#082f49'   // Ultra dark blue
        },
        
        // Secondary Colors - Purple for innovation
        secondary: {
          50: '#faf5ff',   // Very light purple
          100: '#f3e8ff',  // Light purple
          200: '#e9d5ff',  // Lighter purple
          300: '#d8b4fe',  // Light purple
          400: '#c084fc',  // Medium purple
          500: '#a855f7',  // Primary purple
          600: '#9333ea',  // Darker purple
          700: '#7c3aed',  // Dark purple
          800: '#6b21a8',  // Very dark purple
          900: '#581c87',  // Deepest purple
          950: '#3b0764'   // Ultra dark purple
        },
        
        // Accent Colors - Teal for freshness
        accent: {
          50: '#f0fdfa',   // Very light teal
          100: '#ccfbf1',  // Light teal
          200: '#99f6e4',  // Lighter teal
          300: '#5eead4',  // Light teal
          400: '#2dd4bf',  // Medium teal
          500: '#14b8a6',  // Primary teal
          600: '#0d9488',  // Darker teal
          700: '#0f766e',  // Dark teal
          800: '#115e59',  // Very dark teal
          900: '#134e4a',  // Deepest teal
          950: '#042f2e'   // Ultra dark teal
        },
        
        // Success Colors
        success: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green
          200: '#bbf7d0',  // Lighter green
          300: '#86efac',  // Light green
          400: '#4ade80',  // Medium green
          500: '#22c55e',  // Primary green
          600: '#16a34a',  // Darker green
          700: '#15803d',  // Dark green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Deepest green
          950: '#052e16'   // Ultra dark green
        },
        
        // Warning Colors
        warning: {
          50: '#fffbeb',   // Very light amber
          100: '#fef3c7',  // Light amber
          200: '#fde68a',  // Lighter amber
          300: '#fcd34d',  // Light amber
          400: '#fbbf24',  // Medium amber
          500: '#f59e0b',  // Primary amber
          600: '#d97706',  // Darker amber
          700: '#b45309',  // Dark amber
          800: '#92400e',  // Very dark amber
          900: '#78350f',  // Deepest amber
          950: '#451a03'   // Ultra dark amber
        },
        
        // Error Colors
        error: {
          50: '#fef2f2',   // Very light red
          100: '#fee2e2',  // Light red
          200: '#fecaca',  // Lighter red
          300: '#fca5a5',  // Light red
          400: '#f87171',  // Medium red
          500: '#ef4444',  // Primary red
          600: '#dc2626',  // Darker red
          700: '#b91c1c',  // Dark red
          800: '#991b1b',  // Very dark red
          900: '#7f1d1d',  // Deepest red
          950: '#450a0a'   // Ultra dark red
        },
        
        // Enhanced Neutral Colors
        neutral: {
          0: '#ffffff',    // Pure white
          50: '#fafafa',   // Very light gray
          100: '#f5f5f5',  // Light gray
          200: '#e5e5e5',  // Lighter gray
          300: '#d4d4d4',  // Light gray
          400: '#a3a3a3',  // Medium gray
          500: '#737373',  // Primary gray
          600: '#525252',  // Darker gray
          700: '#404040',  // Dark gray
          800: '#262626',  // Very dark gray
          900: '#171717',  // Deepest gray
          950: '#0a0a0a'   // Ultra dark gray
        },
        
        // AI-specific brand colors
        ai: {
          electric: '#00d4ff',    // Electric blue
          neural: '#6366f1',      // Neural purple
          quantum: '#8b5cf6',     // Quantum violet
          cyber: '#06b6d4',       // Cyber cyan
          matrix: '#10b981',      // Matrix green
          pulse: '#f59e0b'        // Pulse amber
        }
      },
      
      // Gradient combinations
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #a855f7 0%, #14b8a6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0c4a6e 0%, #3b0764 100%)',
        'gradient-ai': 'linear-gradient(135deg, #00d4ff 0%, #6366f1 50%, #8b5cf6 100%)',
        'gradient-neural': 'linear-gradient(45deg, #6366f1 0%, #8b5cf6 25%, #06b6d4 50%, #10b981 75%, #f59e0b 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'gradient-card-dark': 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)'
      },
      
      // Box shadows with brand colors
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
        'secondary': '0 4px 14px 0 rgba(168, 85, 247, 0.15)',
        'accent': '0 4px 14px 0 rgba(20, 184, 166, 0.15)',
        'success': '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.15)',
        'error': '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
        'ai-glow': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)',
        'neural': '0 8px 32px rgba(99, 102, 241, 0.12)',
        'quantum': '0 8px 32px rgba(139, 92, 246, 0.12)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-ai': 'pulseAI 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neural': 'neural 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseAI: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' },
        },
        neural: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};