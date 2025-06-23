import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectResponse } from '../types/project';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ProjectCard from '../components/Dashboard/ProjectCard';
import ProjectCreationForm from '../components/Dashboard/ProjectCreationForm';
import projectService from '../services/projectService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uuid) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user?.uuid) return;

    try {
      setError(null);
      const projectIds = await projectService.getProjectIds(user.uuid);
      
      if (projectIds.length === 0) {
        setProjects([]);
        return;
      }

      // Fetch details for each project
      const projectPromises = projectIds.map(id => 
        projectService.getProjectDetails(id)
      );
      
      const projectDetails = await Promise.all(projectPromises);
      setProjects(projectDetails);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleProjectUpdate = (updatedProject: ProjectResponse) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleProjectCreated = (newProject: ProjectResponse) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {getUserDisplayName()}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your AI-powered email campaigns and track their performance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {projects.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Projects</div>
          </Card>
          
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
              {projects.filter(p => p.status === 'COMPLETED').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </Card>
          
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              {projects.filter(p => p.status === 'ONGOING').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Processing</div>
          </Card>
          
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
              {projects.filter(p => p.status === 'NULL').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Ready to Start</div>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Your Projects
            </h2>
            {projects.length > 0 && (
              <span className="text-sm text-gray-500">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {projects.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <div className="text-gray-500 mb-4">
                <Plus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  Create your first project to get started with AI-powered email campaigns
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onProjectUpdate={handleProjectUpdate}
                  onError={handleError}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Creation Form */}
      <ProjectCreationForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onProjectCreated={handleProjectCreated}
        onError={handleError}
      />
    </div>
  );
};

export default DashboardPage;