import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Clock, CheckCircle, XCircle, AlertCircle, Loader2, MessageSquare, Eye, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PlatformFeedbackFormData } from '../types/feedback';
import projectService, { ProjectResponse } from '../services/projectService';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import PlatformFeedbackForm from '../components/Feedback/PlatformFeedbackForm';
import feedbackService from '../services/feedbackService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [downloadingProjects, setDownloadingProjects] = useState<Set<string>>(new Set());
  const [startingProjects, setStartingProjects] = useState<Set<string>>(new Set());
  const [startErrors, setStartErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.uuid) {
      fetchUserProjects();
    }
  }, [user?.uuid]);

  const fetchUserProjects = async () => {
    if (!user?.uuid) return;

    try {
      setLoading(true);
      setError(null);

      // First, get all project IDs for the user
      const ids = await projectService.getUserProjects(user.uuid);
      setProjectIds(ids);

      // Then fetch detailed information for each project
      const projectPromises = ids.map(id => projectService.getProjectById(id));
      const projectsData = await Promise.all(projectPromises);
      
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async (project: ProjectResponse) => {
    if (!project.sheet_link) {
      setStartErrors(prev => ({ 
        ...prev, 
        [project.id]: 'No Google Sheet link found for this project' 
      }));
      return;
    }

    try {
      setStartingProjects(prev => new Set(prev).add(project.id));
      setStartErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[project.id];
        return newErrors;
      });

      // Get stored auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Prepare request data for the endpoint
      const requestData = {
        project_id: project.id,
        original_sheet_url: project.sheet_link,
        proceed_on_invalid_email: true,
        openai_key: 'placeholder_openai_key', // In production, get from project settings
        ss_masters_key: 'placeholder_ss_masters_key', // In production, get from project settings
        exa_api_key: 'placeholder_exa_api_key' // In production, get from project settings
      };

      const response = await fetch('https://personalize-ai-v1.onrender.com/personalized-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start project processing');
      }

      const result = await response.json();
      
      // Update project status locally
      setProjects(prev => prev.map(p => 
        p.id === project.id 
          ? { ...p, status: 'ONGOING' }
          : p
      ));

      // Refresh projects to get updated status from server
      setTimeout(() => {
        fetchUserProjects();
      }, 2000);

    } catch (error: any) {
      console.error('Error starting project:', error);
      setStartErrors(prev => ({ 
        ...prev, 
        [project.id]: error.message || 'Failed to start project processing' 
      }));
    } finally {
      setStartingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
    }
  };

  const handleDownloadSheet = async (projectId: string, projectName: string) => {
    try {
      setDownloadingProjects(prev => new Set(prev).add(projectId));
      
      const blob = await projectService.downloadProjectSheet(projectId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}_results.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const handleFeedbackSubmit = async (feedbackData: PlatformFeedbackFormData) => {
    try {
      await feedbackService.submitPlatformFeedback(feedbackData);
    } catch (error) {
      console.error('Error submitting platform feedback:', error);
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'ONGOING':
        return <Clock className="h-5 w-5 text-primary-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-error-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-warning-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (statusUpper) {
      case 'COMPLETED':
        return `${baseClasses} status-completed`;
      case 'ONGOING':
        return `${baseClasses} status-ongoing`;
      case 'FAILED':
        return `${baseClasses} status-failed`;
      default:
        return `${baseClasses} status-pending`;
    }
  };

  const getStatusText = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'ONGOING':
        return 'ONGOING';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'READY TO PROCESS';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getProgressPercentage = (project: ProjectResponse) => {
    if (project.total_row === 0) return 0;
    return Math.round((project.row_completed / project.total_row) * 100);
  };

  const renderStartButton = (project: ProjectResponse) => {
    const statusUpper = (project.status || '').toUpperCase();
    const isStarting = startingProjects.has(project.id);
    const hasError = startErrors[project.id];
    
    // Only show start button for projects that are ready to process
    if (statusUpper !== 'READY TO PROCESS' && statusUpper !== 'FAILED') {
      return null;
    }

    const getButtonContent = () => {
      if (isStarting) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        );
      }

      if (hasError) {
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry
          </>
        );
      }

      return (
        <>
          <Play className="mr-2 h-4 w-4" />
          Start Project
        </>
      );
    };

    const getButtonClassName = () => {
      let classes = 'transition-all duration-300 ';
      
      if (hasError) {
        classes += 'border-error-300 text-error-700 hover:bg-error-50 ';
      } else {
        classes += 'shadow-lg hover:shadow-xl ai-button-glow ';
      }
      
      return classes;
    };

    return (
      <div className="relative">
        <Button
          onClick={() => handleStartProject(project)}
          disabled={isStarting}
          variant={hasError ? 'outline' : 'primary'}
          size="sm"
          className={getButtonClassName()}
          aria-label={`${isStarting ? 'Starting' : 'Start'} project ${project.name}`}
        >
          {getButtonContent()}
        </Button>
        
        {/* Error Tooltip */}
        {hasError && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-error-50 border border-error-200 rounded text-xs text-error-600 z-10 slide-in">
            {hasError}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen ai-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4 neural-glow" />
          <p className="text-neural-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ai-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-error-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neural-900 mb-2">Error Loading Projects</h1>
          <p className="text-neural-600 mb-4">{error}</p>
          <Button onClick={fetchUserProjects}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neural-900 mb-2">
            Welcome back, <span className="ai-text-gradient">{getUserDisplayName()}</span>!
          </h1>
          <p className="text-neural-600">
            Manage your cold email campaigns and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-6 neural-glow" hover>
            <div className="text-2xl font-bold ai-text-gradient mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-neural-600">Total Projects</div>
          </Card>
          <Card className="text-center p-6 neural-glow" hover>
            <div className="text-2xl font-bold text-success-600 mb-1">
              {projects.filter(p => (p.status || '').toUpperCase() === 'COMPLETED').length}
            </div>
            <div className="text-sm text-neural-600">Completed</div>
          </Card>
          <Card className="text-center p-6 neural-glow" hover>
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {projects.filter(p => (p.status || '').toUpperCase() === 'ONGOING').length}
            </div>
            <div className="text-sm text-neural-600">Ongoing</div>
          </Card>
          <Card className="text-center p-6 neural-glow" hover>
            <div className="text-2xl font-bold text-error-600 mb-1">
              {projects.filter(p => (p.status || '').toUpperCase() === 'FAILED').length}
            </div>
            <div className="text-sm text-neural-600">Failed</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/create-project" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto shadow-xl">
                <Plus className="mr-2 h-5 w-5" />
                Create New Project
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setShowFeedbackModal(true)}
              className="w-full sm:w-auto border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 transition-all duration-300"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-neural-900">Your Projects</h2>
          
          {projects.length === 0 ? (
            <Card className="text-center py-12 p-6 neural-pattern">
              <div className="text-neural-500 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-4 text-neural-300" />
                <h3 className="text-lg font-medium text-neural-900 mb-2">No projects yet</h3>
                <p className="text-neural-600 px-4">Create your first project to get started with AI-powered cold emails</p>
              </div>
              <Link to="/create-project" className="inline-block">
                <Button className="shadow-lg">Create Your First Project</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-xl transition-all duration-300 p-6 neural-glow" hover>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-neural-900 truncate">
                          {project.name}
                        </h3>
                        <span className={getStatusBadge(project.status)}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-neural-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-neural-500">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(project.status)}
                          <span>Status: {getStatusText(project.status)}</span>
                        </div>
                        <span>Mailboxes: {project.no_of_mailbox}</span>
                        <span>Emails/Mailbox: {project.emails_per_mailbox}</span>
                        {(project.status || '').toUpperCase() === 'ONGOING' && (
                          <div className="flex items-center space-x-2">
                            <span>Progress: {getProgressPercentage(project)}%</span>
                            <span>({project.row_completed}/{project.total_row})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                      {/* Start Project Button - positioned to the left */}
                      {renderStartButton(project)}
                      
                      {/* Download Results Button - only for completed projects */}
                      {(project.status || '').toUpperCase() === 'COMPLETED' && project.response_sheet_link && (
                        <a
                          href={project.response_sheet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 border border-neural-300 text-sm font-medium rounded-lg text-neural-700 bg-white/70 hover:bg-neural-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                          onClick={(e) => {
                            if (downloadingProjects.has(project.id)) {
                              e.preventDefault();
                            } else {
                              setDownloadingProjects(prev => new Set(prev).add(project.id));
                              setTimeout(() => {
                                setDownloadingProjects(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(project.id);
                                  return newSet;
                                });
                              }, 2000);
                            }
                          }}
                        >
                          {downloadingProjects.has(project.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download Results
                            </>
                          )}
                        </a>
                      )}
                      
                      {/* View Details Button - positioned to the right */}
                      <Link to={`/project/${project.id}`} className="w-full sm:w-auto">
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto hover:bg-primary-50 hover:text-primary-700">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Share Your Feedback"
        size="lg"
      >
        <PlatformFeedbackForm
          onSubmit={handleFeedbackSubmit}
          onCancel={() => setShowFeedbackModal(false)}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;