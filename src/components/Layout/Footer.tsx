import React from 'react';
import { Brain, Globe, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-neural-900 to-neural-950 text-white transition-all duration-300 neural-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary-400 transition-all duration-300 group-hover:scale-110 neural-glow" />
              <div className="absolute inset-0 bg-primary-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-xl font-bold ai-text-gradient">PERSONALIZED-AI</span>
          </div>
          
          <p className="text-neural-300 mb-6 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Revolutionizing cold email marketing with AI-powered personalization and automation. 
            Transform your outreach strategy with intelligent targeting and compelling content generation.
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="#" 
              className="text-neural-400 hover:text-primary-400 transition-all duration-300 transform hover:scale-110 p-2 rounded-lg hover:bg-neural-800/50"
              aria-label="Website"
            >
              <Globe className="h-6 w-6" />
            </a>
            <a 
              href="#" 
              className="text-neural-400 hover:text-accent-400 transition-all duration-300 transform hover:scale-110 p-2 rounded-lg hover:bg-neural-800/50"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="#" 
              className="text-neural-400 hover:text-cyber-400 transition-all duration-300 transform hover:scale-110 p-2 rounded-lg hover:bg-neural-800/50"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          
          <div className="border-t border-neural-700 pt-6">
            <p className="text-neural-400 text-sm">&copy; 2024 PERSONALIZED-AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;