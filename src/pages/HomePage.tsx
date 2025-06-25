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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 rounded-full text-sm font-medium border border-primary-200 backdrop-blur-sm">
                <Zap className="h-4 w-4 neural-glow" />
                <span>AI-Powered Cold Email Platform</span>
              </div>
            </div>
            
            {/* Main Heading with specified styling */}
            <h1 
              className="font-bold leading-tight mb-6"
              style={{
                fontSize: '48px',
                color: '#1a237e',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Ready to Transform Your Cold Email Strategy?
            </h1>
            
            {/* Subheading with specified styling */}
            <p 
              className="mb-8 max-w-3xl mx-auto px-4 leading-relaxed"
              style={{
                fontSize: '24px',
                color: '#424242',
                fontWeight: '400'
              }}
            >
              Join thousands of sales professionals who've already revolutionized their outreach
            </p>
            
            {/* CTA Button with specified styling */}
            <div className="flex justify-center px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <button
                  className="font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: '#2196f3',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2196f3';
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 via-accent-600 to-cyber-600 px-4 sm:px-6 lg:px-8 neural-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Cold Email Strategy?
          </h2>
          <p className="text-xl text-primary-100 mb-8 px-4 leading-relaxed">
            Join thousands of sales professionals who've already revolutionized their outreach
          </p>
          <div className="flex justify-center px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/90 text-primary-700 hover:bg-white border-white text-lg px-8 py-4 backdrop-blur-sm shadow-2xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;