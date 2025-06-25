import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: 'AI-Powered Personalization',
      description: 'Generate highly personalized emails using advanced AI models including GPT-4, Claude, and Gemini.'
    },
    {
      icon: <Target className="h-8 w-8 text-success-600" />,
      title: 'Smart Targeting',
      description: 'Advanced company and role-based targeting with intelligent lead scoring and segmentation.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-accent-600" />,
      title: 'Performance Analytics',
      description: 'Comprehensive analytics to track performance, optimize campaigns, and maximize ROI.'
    },
    {
      icon: <Shield className="h-8 w-8 text-cyber-600" />,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and encrypted data handling.'
    }
  ];

  return (
    <div className="min-h-screen ai-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neural-50 via-white to-primary-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 neural-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 rounded-full text-sm font-medium border border-primary-200 backdrop-blur-sm">
                <Zap className="h-4 w-4 neural-glow" />
                <span>AI-Powered Cold Email Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-neural-900 mb-6 leading-tight">
              Revolutionize Your
              <span className="ai-text-gradient block sm:inline">
                {' '}Cold Email{' '}
              </span>
              Campaigns
            </h1>
            
            <p className="text-xl text-neural-600 mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              Generate highly personalized cold emails at scale using advanced AI. 
              Increase your response rates by up to 300% with intelligent targeting and automation.
            </p>
            
            <div className="flex justify-center px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-2xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-neural-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neural-900 mb-4">
              Powerful Features for Modern Sales Teams
            </h2>
            <p className="text-xl text-neural-600 max-w-2xl mx-auto px-4">
              Everything you need to create, manage, and optimize your cold email campaigns
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 p-6 neural-glow" hover>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neural-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neural-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Deep Blue Gradient */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-600 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
            `
          }} />
        </div>
        
        {/* Subtle Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Cold Email Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-10 px-4 leading-relaxed max-w-3xl mx-auto">
            Join thousands of sales professionals who've already revolutionized their outreach with AI-powered personalization
          </p>
          <div className="flex justify-center px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-900 border-2 border-white hover:border-gray-100 text-lg px-10 py-4 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Additional Trust Elements */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm font-medium">Setup in 5 Minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;