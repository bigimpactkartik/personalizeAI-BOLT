import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Brain,
  Target,
  Mail,
  Database,
  Zap,
  Eye,
  Calendar,
  User,
  MessageSquare,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectPolling } from '../hooks/useProjectPolling';
import { useDownload } from '../hooks/useDownload';
import projectService from '../services/projectService';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';
import DownloadButton from '../components/UI/DownloadButton';
import PageLoader from '../components/UI/PageLoader';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ProjectFeedbackForm from '../components/Feedback/ProjectFeedbackForm';
import feedbackService from '../services/feedbackService';
import { FeedbackFormData, ProjectFeedback } from '../types/feedback';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'feedback'>('details');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<ProjectFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Use polling hook for real-time updates
  const { project, loading, error, newLogs } = useProjectPolling({
    projectId: id || '',
    enabled: !!id,
    interval: 60000 // 60 seconds
  });

  // Download hook with success/error handling
  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadFromResponseLink,
    downloadProjectSheet,
    reset: resetDownload
  } = useDownload({
    onSuccess: () => {
      console.log('Download completed successfully');
    },
    onError: (error) => {
      console.error('Download failed:', error);
    }
  });

  // Auto-scroll to latest log entry
  useEffect(() => {
    if (newLogs.length > 0 && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [newLogs]);

  useEffect(() => {
    // Load existing feedback when feedback tab is selected
    if (activeTab === 'feedback' && project && user) {
      loadProjectFeedback();
    }
  }, [activeTab, project, user]);

  // Reset download error when project changes
  useEffect(() => {
    if (downloadError) {
      resetDownload();
    }
  }, [project?.id]);

  const loadProjectFeedback = async () => {
    if (!project || !user) return;

    setLoadingFeedback(true);
    try {
      const feedback = await feedbackService.getFeedbackForProject(project.id);
      setExistingFeedback(feedback);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleDownloadResults = async () => {
    if (!project?.response_sheet_link) {
      alert('No results available for download yet.');
      return;
    }

    try {
      await downloadFromResponseLink(project.response_sheet_link, project.name);
    } catch (error) {
      console.error('Results download failed:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData: FeedbackFormData) => {
    if (!project) return;

    try {
      await feedbackService.submitProjectFeedback(project.id, feedbackData);
      setShowFeedbackForm(false);
      // Reload feedback to show the new submission
      await loadProjectFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ONGOING':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return 'green';
      case 'ONGOING':
        return 'blue';
      case 'FAILED':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getStatusText = (status: string | null | undefined) => {
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

  const getProgressPercentage = () => {
    if (!project || project.total_row === 0) return 0;
    return Math.round((project.row_completed / project.total_row) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  if (loading && !project) {
    return (
      <PageLoader 
        text="Loading project details..." 
        size="lg"
      />
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Project Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The project you're looking for doesn't exist."}
          </p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userHasSubmittedFeedback = existingFeedback.some(feedback => feedback.userId === user?.uuid);
  const isOngoing = (project.status || '').toUpperCase() === 'ONGOING';
  const isCompleted = (project.status || '').toUpperCase() === 'COMPLETED';
  const hasDownloadLink = project.response_sheet_link && project.response_sheet_link.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(project.status)}
                  <span className="text-sm sm:text-base font-medium text-gray-600">
                    {getStatusText(project.status)}
                  </span>
                  {isOngoing && (
                    <span className="text-sm text-gray-500">
                      {getProgressPercentage()}% complete ({project.row_completed}/{project.total_row})
                    </span>
                  )}
                  {isOngoing && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <LoadingSpinner size="sm" showText={false} />
                      <span>Auto-updating every 60s</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Single Feedback Button next to project name */}
              {isCompleted && !userHasSubmittedFeedback && (
                <Button
                  onClick={() => {
                    setActiveTab('feedback');
                    setShowFeedbackForm(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Button>
              )}
            </div>
            
            {/* Only Download Results Button */}
            <div className="flex justify-end">
              {isCompleted && hasDownloadLink && (
                <DownloadButton
                  isDownloading={isDownloading}
                  progress={progress}
                  error={downloadError}
                  onDownload={handleDownloadResults}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Download Results
                </DownloadButton>
              )}
            </div>
          </div>
        </div>

        {/* Download Status Alert */}
        {!hasDownloadLink && isCompleted && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Download Not Available</p>
                  <p className="text-yellow-700 text-sm">
                    The download link is not yet available for this project. Please check back later or contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block h-4 w-4 mr-2" />
                Project Details
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="inline-block h-4 w-4 mr-2" />
                Feedback
                {existingFeedback.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {existingFeedback.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Section */}
              {(isOngoing || isCompleted) && (
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Processing Progress</h2>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
                    </div>
                    <ProgressBar 
                      value={getProgressPercentage()} 
                      color={getStatusColor(project.status)}
                      size="lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rows Completed:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.row_completed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Rows:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.total_row}</span>
                    </div>
                  </div>

                  {isOngoing && (
                    <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
                      <LoadingSpinner size="sm" showText={false} />
                      <span>Processing your data with AI...</span>
                    </div>
                  )}
                </Card>
              )}

              {/* Processing Activity */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Processing Activity</h2>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {project.logs && project.logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No activity logs yet</p>
                    </div>
                  ) : (
                    <>
                      {/* Reverse logs to show newest first */}
                      {project.logs && [...project.logs].reverse().map((log, index) => {
                        const isNewLog = newLogs.includes(log);
                        return (
                          <div 
                            key={`${log}-${index}`}
                            className={`flex items-start space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-500 ${
                              isNewLog ? 'fade-in-up bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{log}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={logsEndRef} />
                    </>
                  )}
                </div>
              </Card>

              {/* Project Description */}
              {project.description && (
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Project Description</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Data Source</p>
                      <p className="text-sm text-gray-600">
                        {project.sheet_link ? 'Google Sheets' : 'Excel Upload'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Configuration</p>
                      <p className="text-sm text-gray-600">
                        {project.no_of_mailbox} mailbox{project.no_of_mailbox !== 1 ? 'es' : ''}, 
                        {project.emails_per_mailbox} emails each
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Contact Strategy</p>
                      <p className="text-sm text-gray-600">
                        {project.email_per_contact} email{project.email_per_contact !== 1 ? 's' : ''} per contact
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Batch Duration</p>
                      <p className="text-sm text-gray-600">{project.batch_duration_days} days</p>
                    </div>
                  </div>

                  {/* Download Link Status */}
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Download Status</p>
                      <p className={`text-sm ${hasDownloadLink ? 'text-green-600' : 'text-gray-500'}`}>
                        {hasDownloadLink ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Company Targeting */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Targeting Configuration</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Very Small (≤{project.company_size_very_small_max})</p>
                      <p className="text-gray-600">{project.contact_limit_very_small} contacts</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Small (≤{project.company_size_small_max})</p>
                      <p className="text-gray-600">{project.contact_limit_small_company} contacts</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Medium (≤{project.company_size_medium_max})</p>
                      <p className="text-gray-600">{project.contact_limit_medium_company} contacts</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Large (≤{project.company_size_large_max})</p>
                      <p className="text-gray-600">{project.contact_limit_large_company} contacts</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium text-gray-900">Enterprise (≥{project.company_size_enterprise_min})</p>
                      <p className="text-gray-600">{project.contact_limit_enterprise} contacts</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Seniority Targeting */}
              {(project.seniority_tier_1 && project.seniority_tier_1.length > 0 || project.seniority_tier_2 && project.seniority_tier_2.length > 0) && (
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Seniority Targeting</h3>
                  </div>
                  <div className="space-y-3">
                    {project.seniority_tier_1 && project.seniority_tier_1.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Tier 1 (Primary)</p>
                        <div className="flex flex-wrap gap-1">
                          {project.seniority_tier_1.map((role, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.seniority_tier_2 && project.seniority_tier_2.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Tier 2 (Secondary)</p>
                        <div className="flex flex-wrap gap-1">
                          {project.seniority_tier_2.map((role, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Feedback Tab Content */
          <div className="space-y-6">
            {showFeedbackForm ? (
              <ProjectFeedbackForm
                projectId={project.id}
                projectName={project.name}
                onSubmit={handleFeedbackSubmit}
                onCancel={() => setShowFeedbackForm(false)}
              />
            ) : (
              <>
                {/* Feedback Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Project Feedback</h2>
                    <p className="text-gray-600">
                      {existingFeedback.length > 0 
                        ? `${existingFeedback.length} feedback submission${existingFeedback.length !== 1 ? 's' : ''}`
                        : 'No feedback submitted yet'
                      }
                    </p>
                  </div>
                  
                  {isCompleted && !userHasSubmittedFeedback && (
                    <Button
                      onClick={() => setShowFeedbackForm(true)}
                      className="w-full sm:w-auto"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  )}
                </div>

                {/* Feedback List */}
                {loadingFeedback ? (
                  <Card className="p-8 text-center">
                    <LoadingSpinner 
                      text="Loading feedback..." 
                      size="md"
                    />
                  </Card>
                ) : existingFeedback.length > 0 ? (
                  <div className="space-y-6">
                    {existingFeedback.map((feedback) => (
                      <Card key={feedback.id} className="p-6">
                        <div className="space-y-6">
                          {/* Feedback Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Feedback Submission</p>
                                <p className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</p>
                              </div>
                            </div>
                            {renderStars(feedback.overallSatisfactionRating)}
                          </div>

                          {/* Overall Experience */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Overall Experience</h4>
                            <p className="text-gray-700 text-sm">{feedback.experienceDescription}</p>
                          </div>

                          {/* Performance Ratings */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Performance Ratings</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Processing Speed</p>
                                {renderStars(feedback.processingSpeedRating)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">System Responsiveness</p>
                                {renderStars(feedback.systemResponsivenessRating)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">User Interface</p>
                                {renderStars(feedback.userInterfaceRating)}
                              </div>
                            </div>
                          </div>

                          {/* Quality Assessment */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Quality Assessment</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">Met Requirements:</span>
                                <span className={`text-sm font-medium ${feedback.metRequirements ? 'text-green-600' : 'text-red-600'}`}>
                                  {feedback.metRequirements ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">Deliverables On Time:</span>
                                <span className={`text-sm font-medium ${feedback.deliverablesOnTime ? 'text-green-600' : 'text-red-600'}`}>
                                  {feedback.deliverablesOnTime ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">Overall Quality:</span>
                                {renderStars(feedback.overallQualityRating)}
                              </div>
                              {feedback.requirementsExplanation && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                                  <p className="text-sm text-gray-700">{feedback.requirementsExplanation}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Improvement Areas */}
                          {(feedback.desiredFeatures || feedback.improvementAspects && feedback.improvementAspects.length > 0) && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                              {feedback.desiredFeatures && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-1">Desired Features:</p>
                                  <p className="text-sm text-gray-700">{feedback.desiredFeatures}</p>
                                </div>
                              )}
                              {feedback.improvementAspects && feedback.improvementAspects.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">Improvement Aspects:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {feedback.improvementAspects.map((aspect, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                      >
                                        {aspect}
                                      </span>
                                    ))}
                                  </div>
                                  {feedback.improvementOther && (
                                    <p className="text-sm text-gray-700 mt-2">Other: {feedback.improvementOther}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Comments */}
                          {feedback.additionalComments && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Additional Comments</h4>
                              <p className="text-gray-700 text-sm">{feedback.additionalComments}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
                    <p className="text-gray-600 mb-6">
                      {isCompleted 
                        ? 'Be the first to share your experience with this project.'
                        : 'Feedback will be available once the project is completed.'
                      }
                    </p>
                    {isCompleted && !userHasSubmittedFeedback && (
                      <Button onClick={() => setShowFeedbackForm(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </Button>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;