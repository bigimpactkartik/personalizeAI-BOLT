import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Clock, CheckCircle, XCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { PlatformFeedbackFormData } from '../types/feedback';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';
import Modal from '../components/UI/Modal';
import PlatformFeedbackForm from '../components/Feedback/PlatformFeedbackForm';
import feedbackService from '../services/feedbackService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading } = useProjects();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleFeedbackSubmit = async (feedbackData: PlatformFeedbackFormData) => {
    try {
      await feedbackService.submitPlatformFeedback(feedbackData);
      // Modal will show success state automatically
    } catch (error) {
      console.error('Error submitting platform feedback:', error);
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
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
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              {projects.filter(p => p.status === 'processing').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Processing</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
              {projects.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
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
                          {project.projectName}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getStatusIcon(project.status)}
                          <span className="text-xs sm:text-sm font-medium text-gray-600">
                            {getStatusText(project.status)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <span>Created: {formatDate(project.createdAt)}</span>
                        <span>AI Model: {project.aiModelProvider}</span>
                        {project.status === 'processing' && (
                          <div className="flex items-center space-x-2">
                            <span>Progress:</span>
                            <div className="w-16 sm:w-24">
                              <ProgressBar 
                                value={project.progress} 
                                size="sm" 
                                color={getStatusColor(project.status)}
                              />
                            </div>
                            <span>{project.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                      {project.status === 'completed' && project.resultFilePath && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Download
                        </Button>
                      )}
                      <Link to={`/project/${project.id}`} className="w-full sm:w-auto">
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
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