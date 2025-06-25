import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

// Loading component for page transitions
const PageLoader: React.FC = () => (
  <div className="loading-overlay">
    <div className="text-center">
      <div className="loading-spinner h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-neural-600">Loading...</p>
    </div>
  </div>
);

// Component to handle page transitions
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsLoading(true);
      
      // Add page-loading class to prevent transition conflicts
      document.body.classList.add('page-loading');
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsLoading(false);
        document.body.classList.remove('page-loading');
      }, 150); // Short delay for smooth transition

      return () => {
        clearTimeout(timer);
        document.body.classList.remove('page-loading');
      };
    }
  }, [location, displayLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div key={displayLocation.pathname} className="page-transition">
      {children}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-project"
                      element={
                        <ProtectedRoute>
                          <CreateProjectPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/project/:id"
                      element={
                        <ProtectedRoute>
                          <ProjectDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </PageTransition>
              </main>
              <Footer />
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;