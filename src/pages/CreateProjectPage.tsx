import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Settings, CreditCard } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { ProjectFormData, CompanyTargetingSettings } from '../types';
import Button from '../components/UI/Button';
import StepIndicator from '../components/UI/StepIndicator';
import ProjectDetailsStep from '../components/CreateProject/ProjectDetailsStep';
import UploadDataStep from '../components/CreateProject/UploadDataStep';
import ProjectSettingsStep from '../components/CreateProject/ProjectSettingsStep';
import PaymentStep from '../components/CreateProject/PaymentStep';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    description: '',
    targetAudience: '',
    dataSource: 'excel',
    emailCapacity: {
      mailboxes: 1,
      emailsPerMailbox: 50,
      batchDuration: 7,
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
    'Settings',
    'Payment'
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
        companySize: '11-20',
        numberOfContacts: 3,
        primaryTargetRoles: 'CEO, Founder, Co-Founder',
        secondaryTargetRoles: 'Director, Head of',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '1-50',
        numberOfContacts: 4,
        primaryTargetRoles: 'CEO, Founder, Co-Founder, Owner',
        secondaryTargetRoles: 'Director, Head of, VP',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '50-100',
        numberOfContacts: 6,
        primaryTargetRoles: 'CEO, Founder, Co-Founder, VP',
        secondaryTargetRoles: 'Director, Head of, Senior Manager',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '100-200',
        numberOfContacts: 8,
        primaryTargetRoles: 'Director, VP, Head of',
        secondaryTargetRoles: 'Senior Manager, Manager',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '200-500',
        numberOfContacts: 10,
        primaryTargetRoles: 'Director, Head of, Senior Director',
        secondaryTargetRoles: 'VP, Senior Manager',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      },
      {
        companySize: '500-1000',
        numberOfContacts: 13,
        primaryTargetRoles: 'Senior Manager, Director, Head of',
        secondaryTargetRoles: 'Manager, Senior Director',
        exclusionRoles: '',
        targetDepartments: '',
        exclusionDepartments: ''
      }
    ];
  }

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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

  const handleFinish = async () => {
    try {
      // Create the project in Supabase
      await addProject(formData);
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error (could show a toast notification)
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
          <ProjectSettingsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <PaymentStep
            formData={formData}
            onFinish={handleFinish}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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