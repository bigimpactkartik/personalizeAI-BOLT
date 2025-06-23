import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Settings, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectFormData, CompanyTargetingSettings } from '../types';
import projectService from '../services/projectService';
import Button from '../components/UI/Button';
import StepIndicator from '../components/UI/StepIndicator';
import Card from '../components/UI/Card';
import ProjectDetailsStep from '../components/CreateProject/ProjectDetailsStep';
import UploadDataStep from '../components/CreateProject/UploadDataStep';
import ProjectSettingsStep from '../components/CreateProject/ProjectSettingsStep';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    description: '',
    targetAudience: '',
    dataSource: 'excel',
    emailCapacity: {
      mailboxes: 1,
      emailsPerMailbox: 30,
      batchDuration: 2,
      emailsPerContact: 1,
      processValidEmails: true
    },
    aiModel: {
      provider: 'openai-gpt4'
    },
    companyTargeting: getDefaultCompanyTargeting(),
    advancedSettings: {
      exaPrompt: '',
      icebreakerSystemPrompt: '',
      icebreakerUserPrompt: ''
    }
  });

  const steps = [
    'Project Details',
    'Upload Data',
    'Settings'
  ];

  function getDefaultCompanyTargeting(): CompanyTargetingSettings[] {
    return [
      {
        companySize: '1-10',
        numberOfContacts: 2,
        primaryTargetRoles: 'CEO, Founder',
        secondaryTargetRoles: 'Owner, Director',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '11-50',
        numberOfContacts: 3,
        primaryTargetRoles: 'CEO, Founder, Co-Founder',
        secondaryTargetRoles: 'Director, Head of',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '51-200',
        numberOfContacts: 4,
        primaryTargetRoles: 'CEO, Founder, Co-Founder, VP',
        secondaryTargetRoles: 'Director, Head of, Senior Manager',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '201-1000',
        numberOfContacts: 5,
        primaryTargetRoles: 'Director, VP, Head of',
        secondaryTargetRoles: 'Senior Manager, Manager',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '1000+',
        numberOfContacts: 6,
        primaryTargetRoles: 'Senior Manager, Director, Head of',
        secondaryTargetRoles: 'Manager, Senior Director',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      }
    ];
  }

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    // Step 1 validation
    if (!formData.projectName.trim()) {
      errors.push('Project name is required');
    }
    if (!formData.description.trim()) {
      errors.push('Project description is required');
    }
    if (!formData.targetAudience.trim()) {
      errors.push('Target audience is required');
    }

    // Step 2 validation
    if (formData.dataSource === 'excel' && !formData.excelFile) {
      errors.push('Excel file is required');
    }
    if (formData.dataSource === 'googlesheet' && !formData.googleSheetLink?.trim()) {
      errors.push('Google Sheet link is required');
    }

    // Step 3 validation
    if (formData.emailCapacity.mailboxes < 1) {
      errors.push('At least 1 mailbox is required');
    }
    if (formData.emailCapacity.emailsPerMailbox < 1) {
      errors.push('At least 1 email per mailbox is required');
    }
    if (formData.emailCapacity.batchDuration < 1) {
      errors.push('Batch duration must be at least 1 day');
    }
    if (formData.emailCapacity.emailsPerContact < 1) {
      errors.push('At least 1 email per contact is required');
    }

    return errors;
  };

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors when form data changes
    if (error) setError(null);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uuid) {
      setError('User not authenticated');
      return;
    }

    // Validate form data
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the project
      const createdProject = await projectService.createProject(formData, user.uuid);
      
      setSuccess(true);
      
      // Redirect to project details after a short delay
      setTimeout(() => {
        navigate(`/project/${createdProject.id}`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <UploadDataStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <div className="fade-in-up">
            <ProjectSettingsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmit}
              onPrevious={handlePrevious}
            />
            
            {/* Submit Section */}
            <Card className="p-6 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Create Project?</h3>
                <p className="text-gray-600 mb-6">
                  Review your settings and click "Create Project" to start processing your data.
                </p>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-600 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {loading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Project Created Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Your project has been created and is now being processed. You'll be redirected to the project details page.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Redirecting...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-sm sm:text-base"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create New Project
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Set up your AI-powered cold email campaign in just a few steps
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
          />
        </div>

        {/* Step Content */}
        <div className="transition-all duration-300 ease-in-out">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;