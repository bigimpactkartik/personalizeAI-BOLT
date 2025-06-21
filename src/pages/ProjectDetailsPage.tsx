import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
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
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';
import ProjectFeedbackForm from '../components/Feedback/ProjectFeedbackForm';
import feedbackService from '../services/feedbackService';
import { FeedbackFormData, ProjectFeedback } from '../types/feedback';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { user } = useAuth();
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'feedback'>('details');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<ProjectFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (!project) return;

    // Initialize processing logs based on project status
    if (project.status === 'completed') {
      setProcessingLogs([
        '✅ Project initialized successfully',
        '✅ Data source validated and loaded',
        '✅ AI model configured and ready',
        '✅ Lead data processed and cleaned',
        '✅ Company targeting rules applied',
        '✅ Personalized emails generated',
        '✅ Quality checks completed',
        '✅ Results compiled and ready for download'
      ]);
    } else if (project.status === 'processing') {
      const currentLogs = [
        '✅ Project initialized successfully',
        '✅ Data source validated and loaded',
        '✅ AI model configured and ready',
        '🔄 Processing lead data and applying filters...',
        '⏳ Generating personalized email content...'
      ];
      setProcessingLogs(currentLogs);
      
      // Simulate real-time processing updates
      if (!isSimulating) {
        setIsSimulating(true);
        simulateProcessing();
      }
    } else if (project.status === 'pending') {
      setProcessingLogs(['⏳ Project queued for processing...']);
    } else if (project.status === 'failed') {
      setProcessingLogs([
        '✅ Project initialized successfully',
        '✅ Data source validated and loaded',
        '❌ Error: AI model configuration failed',
        '❌ Processing stopped due to configuration error'
      ]);
    }
  }, [project?.status, project?.progress]);

  useEffect(() => {
    // Load existing feedback when feedback tab is selected
    if (activeTab === 'feedback' && project && user) {
      loadProjectFeedback();
    }
  }, [activeTab, project, user]);

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

  const simulateProcessing = () => {
    if (!project || project.status !== 'processing') return;

    const interval = setInterval(() => {
      const currentProgress = project.progress;
      
      if (currentProgress < 100) {
        const newProgress = Math.min(currentProgress + Math.random() * 15, 100);
        updateProject(project.id, { progress: newProgress });

        // Add new log entries based on progress
        if (newProgress > 40 && currentProgress <= 40) {
          setProcessingLogs(prev => [
            ...prev.slice(0, -1),
            '✅ Lead data processed and cleaned',
            '🔄 Applying company targeting rules...'
          ]);
        } else if (newProgress > 60 && currentProgress <= 60) {
          setProcessingLogs(prev => [
            ...prev.slice(0, -1),
            '✅ Company targeting rules applied',
            '🔄 Generating personalized email content...'
          ]);
        } else if (newProgress > 80 && currentProgress <= 80) {
          setProcessingLogs(prev => [
            ...prev.slice(0, -1),
            '✅ Personalized emails generated',
            '🔄 Running quality checks and validation...'
          ]);
        } else if (newProgress >= 100) {
          setProcessingLogs(prev => [
            ...prev.slice(0, -1),
            '✅ Quality checks completed',
            '✅ Results compiled and ready for download'
          ]);
          updateProject(project.id, { 
            status: 'completed',
            progress: 100,
            resultFilePath: `/results/project-${project.id}-results.xlsx`
          });
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleDownload = () => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${project?.projectName.replace(/\s+/g, '_')}_results.xlsx`;
    link.click();
    
    // Show success message (you could use a toast notification here)
    alert('Download started! Your personalized email results are being downloaded.');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userHasSubmittedFeedback = existingFeedback.some(feedback => feedback.userId === user?.uuid);

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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {project.projectName}
              </h1>
              <div className="flex items-center space-x-3">
                {getStatusIcon(project.status)}
                <span className="text-sm sm:text-base font-medium text-gray-600">
                  {getStatusText(project.status)}
                </span>
                {project.status === 'processing' && (
                  <span className="text-sm text-gray-500">
                    {project.progress}% complete
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {project.status === 'completed' && !userHasSubmittedFeedback && (
                <Button
                  onClick={() => {
                    setActiveTab('feedback');
                    setShowFeedbackForm(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Submit Feedback
                </Button>
              )}
              {project.status === 'completed' && project.resultFilePath && (
                <Button onClick={handleDownload} size="lg" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Download Results
                </Button>
              )}
            </div>
          </div>
        </div>

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
              {(project.status === 'processing' || project.status === 'completed') && (
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Processing Progress</h2>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm text-gray-500">{project.progress}%</span>
                    </div>
                    <ProgressBar 
                      value={project.progress} 
                      color={getStatusColor(project.status)}
                      size="lg"
                    />
                  </div>

                  {project.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing your data with AI...</span>
                    </div>
                  )}
                </Card>
              )}

              {/* Processing Commentary */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Processing Activity</h2>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {processingLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {log.startsWith('✅') && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {log.startsWith('🔄') && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                        {log.startsWith('⏳') && <Clock className="h-4 w-4 text-yellow-600" />}
                        {log.startsWith('❌') && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">
                        {log.replace(/^[✅🔄⏳❌]\s*/, '')}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Project Description */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Project Description</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Target Audience</p>
                      <p className="text-sm text-gray-600">{project.targetAudience}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Data Source</p>
                      <p className="text-sm text-gray-600 capitalize">{project.dataSource}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Brain className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Model</p>
                      <p className="text-sm text-gray-600 capitalize">{project.aiModelProvider}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Email Capacity */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Email Capacity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mailboxes</span>
                    <span className="text-sm font-medium text-gray-900">{project.emailCapacity.mailboxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Emails per Mailbox</span>
                    <span className="text-sm font-medium text-gray-900">{project.emailCapacity.emailsPerMailbox}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Batch Duration</span>
                    <span className="text-sm font-medium text-gray-900">{project.emailCapacity.batchDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Emails per Contact</span>
                    <span className="text-sm font-medium text-gray-900">{project.emailCapacity.emailsPerContact}</span>
                  </div>
                </div>
              </Card>

              {/* Company Targeting */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Targeting Rules</h3>
                </div>
                <div className="space-y-4">
                  {project.companyTargeting.slice(0, 2).map((targeting, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Company Size: {targeting.companySize}
                        </span>
                        <span className="text-xs text-gray-500">
                          {targeting.numberOfContacts} contacts
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Primary: {targeting.primaryTargetRoles}
                      </p>
                    </div>
                  ))}
                  {project.companyTargeting.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{project.companyTargeting.length - 2} more targeting rules
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Feedback Tab Content */
          <div className="space-y-6">
            {showFeedbackForm ? (
              <ProjectFeedbackForm
                projectId={project.id}
                projectName={project.projectName}
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
                  
                  {project.status === 'completed' && !userHasSubmittedFeedback && (
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading feedback...</p>
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
                          {(feedback.desiredFeatures || feedback.improvementAspects.length > 0) && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                              {feedback.desiredFeatures && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-1">Desired Features:</p>
                                  <p className="text-sm text-gray-700">{feedback.desiredFeatures}</p>
                                </div>
                              )}
                              {feedback.improvementAspects.length > 0 && (
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
                      {project.status === 'completed' 
                        ? 'Be the first to share your experience with this project.'
                        : 'Feedback will be available once the project is completed.'
                      }
                    </p>
                    {project.status === 'completed' && !userHasSubmittedFeedback && (
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