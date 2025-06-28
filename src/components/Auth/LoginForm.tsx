import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import ThemeToggle from '../UI/ThemeToggle';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // Redirect to intended destination
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.message || 'Invalid email or password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForgotPasswordSent(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 fade-in-up">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600 px-2">
                {forgotPasswordSent 
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'
                }
              </p>
            </div>

            {!forgotPasswordSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="relative">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Send Reset Instructions
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 mb-6 px-2">
                  We've sent password reset instructions to <strong className="text-gray-900 break-all">{forgotPasswordEmail}</strong>
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSent(false);
                  setForgotPasswordEmail('');
                }}
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-300"
              >
                Back to Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 fade-in-up relative">
      {/* Settings Panel */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showSettings ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Theme</span>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 z-40 w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <Settings className="h-5 w-5 text-gray-600" />
      </button>

      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg slide-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-red-600 text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                className="pl-10"
              />
              <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-300"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-300 text-left sm:text-right"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full shadow-xl"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-300">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;