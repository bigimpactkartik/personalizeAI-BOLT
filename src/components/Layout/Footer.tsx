import React from 'react';
import { Brain, Globe, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer 
      className="relative overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
        color: '#f8fafc'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(217, 70, 239, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Subtle Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.5) 50%, transparent 100%)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center space-x-3 mb-8 group">
            <div className="relative">
              <Brain 
                className="h-10 w-10 transition-all duration-300 group-hover:scale-110" 
                style={{ color: '#6366f1' }}
              />
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"
                style={{ backgroundColor: '#6366f1' }}
              />
            </div>
            <span 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ 
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              PERSONALIZED-AI
            </span>
          </div>
          
          {/* Description */}
          <p 
            className="mb-8 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed"
            style={{ color: '#cbd5e1' }}
          >
            Revolutionizing cold email marketing with AI-powered personalization and automation. 
            Transform your outreach strategy with intelligent targeting and compelling content generation.
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a 
              href="#" 
              className="group p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
              style={{ 
                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                color: '#94a3b8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.color = '#60a5fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              aria-label="Website"
            >
              <Globe className="h-6 w-6" />
            </a>
            <a 
              href="#" 
              className="group p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
              style={{ 
                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                color: '#94a3b8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(217, 70, 239, 0.2)';
                e.currentTarget.style.color = '#c084fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="#" 
              className="group p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
              style={{ 
                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                color: '#94a3b8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.2)';
                e.currentTarget.style.color = '#22d3ee';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-105"
              style={{ color: '#cbd5e1' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-105"
              style={{ color: '#cbd5e1' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-105"
              style={{ color: '#cbd5e1' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
            >
              Support
            </a>
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-105"
              style={{ color: '#cbd5e1' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
            >
              Documentation
            </a>
          </div>
          
          {/* Copyright */}
          <div 
            className="pt-6 border-t"
            style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
          >
            <p 
              className="text-sm"
              style={{ color: '#94a3b8' }}
            >
              &copy; 2024 PERSONALIZED-AI. All rights reserved. | Built with ❤️ for modern sales teams
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;