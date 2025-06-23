import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Calendar,
  Users,
  Mail,
  ExternalLink
} from 'lucide-react';
import { ProjectResponse } from '../../types/project';
import Button from '../UI/Button';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Modal from '../UI/Modal';
import projectService from '../../services/projectService';

interface ProjectCardProps {
  project: ProjectResponse;
  onProjectUpdate: (updatedProject: ProjectResponse) => void;
  onError: (error: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onProjectUpdate,
  onError
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [animatedLogs, setAnimatedLogs] = useState<Set<number>>(new Set());
  const [previousLogCount, setPreviousLogCount] = useState(project.logs?.length ?? 0);

  useEffect(() => {
    // Start polling if project is ongoing
    if (project.status === 'ONGOING') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [project.status]);

  useEffect(() => {
    // Animate only new log entries
    const currentLogCount = project.logs?.length ?? 0;
    if (currentLogCount > previousLogCount) {
      const newLogIndices = new Set<number>();
      for (let i = previousLogCount; i < currentLogCount; i++) {
        newLogIndices.add(i);
      }
      setAnimatedLogs(newLogIndices);
      setPreviousLogCount(currentLogCount);

      // Remove animation class after animation completes
      setTimeout(() => {
        setAnimatedLogs(new Set());
      }, 500);
    }
  }, [project.logs?.length, previousLogCount]);

  const startPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const updatedProject = await projectService.getProjectDetails(project.id);
        onProjectUpdate(updatedProject);
        
        // Stop polling if project is completed
        if (updatedProject.status === 'COMPLETED') {
          clearInterval(interval);
          setIsPolling(false);
        }
      } catch (error: any) {
        onError(error.message);
        clearInterval(interval);
        setIsPolling(false);
      }
    }, 60000); // Poll every 60 seconds

    // Store interval ID for cleanup
    (window as any)[`polling_${project.id}`] = interval;
  };

  const stopPolling = () => {
    const interval = (window as any)[`polling_${project.id}`];
    if (interval) {
      clearInterval(interval);
      delete (window as any)[`polling_${project.id}`];
    }
    setIsPolling(false);
  };

  const handleStartProject = async () => {
    setIsStarting(true);
    try {
      await projectService.startProject(project.id);
      const updatedProject = await projectService.getProjectDetails(project.id);
      onProjectUpdate(updatedProject);
      setShowConfirmDialog(false);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleDownload = () => {
    if (project.response_sheet_link) {
      window.open(project.response_sheet_link, '_blank');
    }
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ONGOING':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'COMPLETED':
        return 'green';
      case 'ONGOING':
        return 'blue';
      default:
        return 'yellow';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'COMPLETED':
        return 'Completed';
      case 'ONGOING':
        return 'Processing';
      default:
        return 'Ready to Start';
    }
  };

  const getProgress = () => {
    if (project.total_row === 0) return 0;
    return Math.round((project.row_completed / project.total_row) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {getStatusIcon()}
                  <span className="text-sm font-medium text-gray-600">
                    {getStatusText()}
                  </span>
                  {isPolling && (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin ml-2" />
                  )}
                </div>
              </div>
              
              {project.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
              {project.status === 'NULL' && (
                <Button 
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full sm:w-auto"
                  disabled={isStarting}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Project
                </Button>
              )}
              
              {project.status === 'COMPLETED' && project.response_sheet_link && (
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Sheet
                </Button>
              )}
            </div>
          </div>

          {/* Progress Section */}
          {(project.status === 'ONGOING' || project.status === 'COMPLETED') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">
                  {project.row_completed} / {project.total_row} rows
                </span>
              </div>
              <ProgressBar 
                value={getProgress()} 
                color={getStatusColor()}
                size="lg"
              />
              <div className="text-right">
                <span className="text-sm text-gray-500">{getProgress()}% complete</span>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Mailboxes</p>
                <p className="font-medium">{project.no_of_mailbox}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Emails/Mailbox</p>
                <p className="font-medium">{project.emails_per_mailbox}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Batch Duration</p>
                <p className="font-medium">{project.batch_duration_days} days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Email/Contact</p>
                <p className="font-medium">{project.email_per_contact}</p>
              </div>
            </div>
          </div>

          {/* Sheet Link */}
          {project.sheet_link && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Data Source:</span>
              <a 
                href={project.sheet_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate"
              >
                View Sheet
              </a>
            </div>
          )}

          {/* Logs Section */}
          {project.logs && project.logs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Activity Logs</h4>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {project.logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-3 p-3 bg-gray-50 rounded-lg text-sm ${
                      animatedLogs.has(index) ? 'fade-in-up' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 flex-1">{log}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Start Project Execution"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to start the execution of "{project.name}"? 
            This will begin processing your data and cannot be undone.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Project Details:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {project.no_of_mailbox} mailbox(es) configured</li>
              <li>• {project.emails_per_mailbox} emails per mailbox</li>
              <li>• {project.batch_duration_days} day batch duration</li>
              <li>• {project.email_per_contact} email(s) per contact</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isStarting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartProject}
              loading={isStarting}
              disabled={isStarting}
              className="w-full sm:w-auto"
            >
              {isStarting ? 'Starting...' : 'Start Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectCard;