import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calculator, Key, Users, Settings, MessageSquare, Clock, Target } from 'lucide-react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Card from '../UI/Card';

interface ProjectSettingsStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ProjectSettingsStep: React.FC<ProjectSettingsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious
}) => {
  const [showEmailCapacity, setShowEmailCapacity] = useState(false);
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [showCompanyTargeting, setShowCompanyTargeting] = useState(false);
  const [showTimingSettings, setShowTimingSettings] = useState(false);
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const aiModelOptions = [
    { value: 'openai-gpt4', label: 'OpenAI GPT-4', description: 'Most versatile and creative' },
    { value: 'openai-gpt4o', label: 'OpenAI GPT-4o', description: 'Optimized for speed and efficiency' },
    { value: 'openai-gpt35', label: 'OpenAI GPT-3.5 Turbo', description: 'Fast and cost-effective' },
    { value: 'gemini-pro', label: 'Google Gemini Pro', description: 'Great for research and analysis' },
    { value: 'gemini-ultra', label: 'Google Gemini Ultra', description: 'Most capable Gemini model' },
    { value: 'claude-opus', label: 'Anthropic Claude 3 Opus', description: 'Most powerful Claude model' },
    { value: 'claude-sonnet', label: 'Anthropic Claude 3 Sonnet', description: 'Balanced performance and speed' },
    { value: 'claude-haiku', label: 'Anthropic Claude 3 Haiku', description: 'Fastest Claude model' }
  ];

  const calculateCapacity = () => {
    const { mailboxes, emailsPerMailbox, batchDuration, emailsPerContact } = formData.emailCapacity;
    const totalEmails = mailboxes * emailsPerMailbox;
    const emailsPerDay = totalEmails / batchDuration;
    const contactsPerDay = emailsPerDay / emailsPerContact;
    const totalContacts = contactsPerDay * batchDuration;
    
    setCalculatedCapacity(Math.floor(totalContacts));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate email capacity
    if (formData.emailCapacity.mailboxes < 1) {
      newErrors.mailboxes = 'At least 1 mailbox is required';
    }
    if (formData.emailCapacity.emailsPerMailbox < 1) {
      newErrors.emailsPerMailbox = 'At least 1 email per mailbox is required';
    }
    if (formData.emailCapacity.batchDuration < 1) {
      newErrors.batchDuration = 'Batch duration must be at least 1 day';
    }
    if (formData.emailCapacity.emailsPerContact < 1) {
      newErrors.emailsPerContact = 'At least 1 email per contact is required';
    }

    // Validate AI model selection
    if (!formData.aiModel.provider) {
      newErrors.aiModel = 'Please select an AI model';
    }

    // Validate required prompts
    if (!formData.prompts?.customPromptForExaCompanyInformationExtraction?.trim()) {
      newErrors.exaPrompt = 'Custom prompt for EXA company information extraction is required';
    }
    if (!formData.prompts?.icebreakerPersonalizedSystemPrompt?.trim()) {
      newErrors.systemPrompt = 'Icebreaker system prompt is required';
    }
    if (!formData.prompts?.icebreakerPersonalizedUserPrompt?.trim()) {
      newErrors.userPrompt = 'Icebreaker user prompt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const updateEmailCapacity = (field: string, value: number | boolean) => {
    updateFormData({
      emailCapacity: {
        ...formData.emailCapacity,
        [field]: value
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateAiModel = (field: string, value: string) => {
    updateFormData({
      aiModel: {
        ...formData.aiModel,
        [field]: value
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updatePrompts = (field: string, value: string) => {
    updateFormData({
      prompts: {
        ...formData.prompts,
        [field]: value
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateContactLimits = (field: string, value: number) => {
    updateFormData({
      contactLimits: {
        ...formData.contactLimits,
        [field]: value
      }
    });
  };

  const updateCompanyTargeting = (companySize: string, field: string, value: string[]) => {
    updateFormData({
      companyTargetingBySize: {
        ...formData.companyTargetingBySize,
        [companySize]: {
          ...formData.companyTargetingBySize[companySize as keyof typeof formData.companyTargetingBySize],
          [field]: value
        }
      }
    });
  };

  const updateTimingSettings = (field: string, value: number) => {
    updateFormData({
      timingSettings: {
        ...formData.timingSettings,
        [field]: value
      }
    });
  };

  const companySizes = [
    { key: 'verySmall', label: 'Very Small (1-10)', contactLimit: 'verySmall' },
    { key: 'small', label: 'Small (11-50)', contactLimit: 'smallCompany' },
    { key: 'medium', label: 'Medium (51-200)', contactLimit: 'mediumCompany' },
    { key: 'large', label: 'Large (201-1000)', contactLimit: 'largeCompany' },
    { key: 'enterprise', label: 'Enterprise (1000+)', contactLimit: 'enterprise' }
  ];

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Configure your email capacity, AI model, prompts, and targeting settings
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Email Capacity Settings - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowEmailCapacity(!showEmailCapacity)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Email Capacity Settings</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showEmailCapacity ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showEmailCapacity ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Input
                    label="No. of Mailboxes"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1-100"
                    value={formData.emailCapacity.mailboxes}
                    onChange={(e) => updateEmailCapacity('mailboxes', parseInt(e.target.value) || 1)}
                    error={errors.mailboxes}
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Input
                    label="Emails per Mailbox"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="1-1000"
                    value={formData.emailCapacity.emailsPerMailbox}
                    onChange={(e) => updateEmailCapacity('emailsPerMailbox', parseInt(e.target.value) || 1)}
                    error={errors.emailsPerMailbox}
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Input
                    label="Batch Duration (Days)"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="1-365"
                    value={formData.emailCapacity.batchDuration}
                    onChange={(e) => updateEmailCapacity('batchDuration', parseInt(e.target.value) || 1)}
                    error={errors.batchDuration}
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Input
                    label="Emails per Contact"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={formData.emailCapacity.emailsPerContact}
                    onChange={(e) => updateEmailCapacity('emailsPerContact', parseInt(e.target.value) || 1)}
                    error={errors.emailsPerContact}
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.emailCapacity.processValidEmails}
                      onChange={(e) => updateEmailCapacity('processValidEmails', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">Process only valid emails</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button variant="outline" onClick={calculateCapacity} className="w-full sm:w-auto transition-all duration-200">
                    Calculate Capacity
                  </Button>
                  {calculatedCapacity !== null && (
                    <div className="text-xs sm:text-sm text-gray-600 slide-in">
                      Estimated capacity: <span className="font-semibold text-blue-600">{calculatedCapacity}</span> contacts
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Model Settings - Always Visible */}
          <div className="transition-all duration-300 ease-in-out">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              AI Models
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <Select
                  label="Select AI Model"
                  options={aiModelOptions}
                  value={formData.aiModel.provider}
                  onChange={(value) => updateAiModel('provider', value)}
                  placeholder="Choose an AI model"
                  error={errors.aiModel}
                  required
                />

                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Note:</strong> AI model configuration and API keys will be handled automatically by our system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Settings - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowPromptSettings(!showPromptSettings)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>AI Prompt Settings</span>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full ml-2">Required</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showPromptSettings ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showPromptSettings ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Prompt for EXA Company Information Extraction <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.exaPrompt ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      rows={4}
                      placeholder="Enter your custom prompt for extracting company information using EXA. This prompt will be used to analyze and identify company-related data..."
                      value={formData.prompts?.customPromptForExaCompanyInformationExtraction || ''}
                      onChange={(e) => updatePrompts('customPromptForExaCompanyInformationExtraction', e.target.value)}
                    />
                    {errors.exaPrompt && (
                      <p className="mt-1 text-sm text-red-600">{errors.exaPrompt}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icebreaker Personalized System Prompt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.systemPrompt ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      rows={4}
                      placeholder="Enter the system instructions for personalizing icebreakers..."
                      value={formData.prompts?.icebreakerPersonalizedSystemPrompt || ''}
                      onChange={(e) => updatePrompts('icebreakerPersonalizedSystemPrompt', e.target.value)}
                    />
                    {errors.systemPrompt && (
                      <p className="mt-1 text-sm text-red-600">{errors.systemPrompt}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icebreaker Personalized User Prompt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.userPrompt ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      rows={4}
                      placeholder="Enter the user context for icebreaker generation..."
                      value={formData.prompts?.icebreakerPersonalizedUserPrompt || ''}
                      onChange={(e) => updatePrompts('icebreakerPersonalizedUserPrompt', e.target.value)}
                    />
                    {errors.userPrompt && (
                      <p className="mt-1 text-sm text-red-600">{errors.userPrompt}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Limits by Company Size */}
          <div className="transition-all duration-300 ease-in-out">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Contact Limits by Company Size
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companySizes.map((size) => (
                  <div key={size.key}>
                    <Input
                      label={size.label}
                      type="number"
                      min="0"
                      max="50"
                      value={formData.contactLimits?.[size.contactLimit as keyof typeof formData.contactLimits] || 0}
                      onChange={(e) => updateContactLimits(size.contactLimit, parseInt(e.target.value) || 0)}
                      style={{ 
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timing Settings */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowTimingSettings(!showTimingSettings)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Timing Settings</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showTimingSettings ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showTimingSettings ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Days Between Contacts"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.timingSettings?.daysBetweenContacts || 3}
                    onChange={(e) => updateTimingSettings('daysBetweenContacts', parseInt(e.target.value) || 3)}
                    helperText="Minimum days before contacting the same person again"
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Input
                    label="Follow-up Cycle Days"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.timingSettings?.followUpCycleDays || 7}
                    onChange={(e) => updateTimingSettings('followUpCycleDays', parseInt(e.target.value) || 7)}
                    helperText="Days after which follow-up emails are triggered"
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Targeting by Size - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowCompanyTargeting(!showCompanyTargeting)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Advanced Company Targeting</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showCompanyTargeting ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showCompanyTargeting ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="space-y-6">
                  {companySizes.map((size) => (
                    <div key={size.key} className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                        {size.label}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Target Roles
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            rows={2}
                            placeholder="Enter roles separated by commas (e.g., CEO, Founder, Director)"
                            value={formData.companyTargetingBySize?.[size.key as keyof typeof formData.companyTargetingBySize]?.primaryTargetRoles?.join(', ') || ''}
                            onChange={(e) => updateCompanyTargeting(size.key, 'primaryTargetRoles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Target Roles
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            rows={2}
                            placeholder="Enter secondary roles separated by commas"
                            value={formData.companyTargetingBySize?.[size.key as keyof typeof formData.companyTargetingBySize]?.secondaryTargetRoles?.join(', ') || ''}
                            onChange={(e) => updateCompanyTargeting(size.key, 'secondaryTargetRoles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exclusion Roles
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            rows={2}
                            placeholder="Enter roles to exclude separated by commas"
                            value={formData.companyTargetingBySize?.[size.key as keyof typeof formData.companyTargetingBySize]?.exclusionRoles?.join(', ') || ''}
                            onChange={(e) => updateCompanyTargeting(size.key, 'exclusionRoles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Target Departments
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                              rows={2}
                              placeholder="Enter departments separated by commas"
                              value={formData.companyTargetingBySize?.[size.key as keyof typeof formData.companyTargetingBySize]?.targetDepartments?.join(', ') || ''}
                              onChange={(e) => updateCompanyTargeting(size.key, 'targetDepartments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Exclusion Departments
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                              rows={2}
                              placeholder="Enter departments to exclude"
                              value={formData.companyTargetingBySize?.[size.key as keyof typeof formData.companyTargetingBySize]?.exclusionDepartments?.join(', ') || ''}
                              onChange={(e) => updateCompanyTargeting(size.key, 'exclusionDepartments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
          <Button variant="outline" onClick={handlePrevious} className="w-full sm:w-auto transition-all duration-200">
            Previous
          </Button>
          <Button onClick={handleNext} size="lg" className="w-full sm:w-auto transition-all duration-200">
            Review & Create
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectSettingsStep;