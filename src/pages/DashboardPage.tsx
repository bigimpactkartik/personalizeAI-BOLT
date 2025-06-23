import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Clock, CheckCircle, XCircle, AlertCircle, Loader2, MessageSquare, Eye } from 'lucide-react';
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
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'ONGOING':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (statusUpper) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ONGOING':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Projects</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchUserProjects}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your cold email campaigns and track their performance
          </p>
        </div>

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
              {projects.filter(p => (p.status || '').toUpperCase() === 'COMPLETED').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              {projects.filter(p => (p.status || '').toUpperCase() === 'ONGOING').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Ongoing</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
              {projects.filter(p => (p.status || '').toUpperCase() === 'FAILED').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Failed</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/create-project" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Project
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setShowFeedbackModal(true)}
              className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Projects</h2>
          
          {projects.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <div className="text-gray-500 mb-4">
                <Plus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">Create your first project to get started with AI-powered cold emails</p>
              </div>
              <Link to="/create-project" className="inline-block">
                <Button>Create Your First Project</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {project.name}
                        </h3>
                        <span className={getStatusBadge(project.status)}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
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
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                      {(project.status || '').toUpperCase() === 'COMPLETED' && project.response_sheet_link && (
                        <a
                          href={project.response_sheet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full sm:w-auto"
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
                              <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Download Sheet
                            </>
                          )}
                        </a>
                      )}
                      <Link to={`/project/${project.id}`} className="w-full sm:w-auto">
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                          <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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