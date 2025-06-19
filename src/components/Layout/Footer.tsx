import React from 'react';
import { Brain, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 group">
            <div className="relative">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold">PERSONALIZED-AI</span>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Revolutionizing cold email marketing with AI-powered personalization and automation. 
            Transform your outreach strategy with intelligent targeting and compelling content generation.
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">&copy; 2024 PERSONALIZED-AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;