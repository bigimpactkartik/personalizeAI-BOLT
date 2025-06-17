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
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: 'AI-Powered Personalization',
      description: 'Generate highly personalized emails using advanced AI models including GPT-4, Claude, and Gemini.'
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: 'Smart Targeting',
      description: 'Advanced company and role-based targeting with intelligent lead scoring and segmentation.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: 'Performance Analytics',
      description: 'Comprehensive analytics to track performance, optimize campaigns, and maximize ROI.'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and encrypted data handling.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>AI-Powered Cold Email Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionize Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Cold Email{' '}
              </span>
              Campaigns
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate highly personalized cold emails at scale using advanced AI. 
              Increase your response rates by up to 300% with intelligent targeting and automation.
            </p>
            
            <div className="flex justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Sales Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and optimize your cold email campaigns
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Cold Email Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of sales professionals who've already revolutionized their outreach
          </p>
          <div className="flex justify-center">
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50">
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