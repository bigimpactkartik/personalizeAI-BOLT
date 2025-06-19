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
  User
} from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

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
            
            {project.status === 'completed' && project.resultFilePath && (
              <Button onClick={handleDownload} size="lg" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Download Results
              </Button>
            )}
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default ProjectDetailsPage;