import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calculator, Key, Users, Settings } from 'lucide-react';
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
  const [showAdvancedTargeting, setShowAdvancedTargeting] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
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

    // Validate API keys based on selected model
    const provider = formData.aiModel.provider;
    if (provider?.startsWith('openai') && !formData.aiModel.openaiKey?.trim()) {
      newErrors.openaiKey = 'OpenAI API key is required';
    }
    if (provider?.startsWith('gemini') && !formData.aiModel.geminiKey?.trim()) {
      newErrors.geminiKey = 'Gemini API key is required';
    }
    if (provider?.startsWith('claude') && !formData.aiModel.claudeKey?.trim()) {
      newErrors.claudeKey = 'Claude API key is required';
    }
    if (provider === 'ssm' && !formData.aiModel.ssmKey?.trim()) {
      newErrors.ssmKey = 'SSM API key is required';
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

  const updateCompanyTargeting = (index: number, field: string, value: string | number) => {
    const updated = [...formData.companyTargeting];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ companyTargeting: updated });
  };

  const updateAdvancedSettings = (field: string, value: string) => {
    updateFormData({
      advancedSettings: {
        ...formData.advancedSettings,
        [field]: value
      }
    });
  };

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Configure your email capacity, AI model, and targeting settings
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

                {/* All API Key Options */}
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      label="OpenAI API Key"
                      type="password"
                      placeholder="sk-..."
                      value={formData.aiModel.openaiKey || ''}
                      onChange={(e) => updateAiModel('openaiKey', e.target.value)}
                      error={errors.openaiKey}
                      className="pl-10"
                    />
                    <Key className="absolute left-3 top-9 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Gemini API Key"
                      type="password"
                      placeholder="AI..."
                      value={formData.aiModel.geminiKey || ''}
                      onChange={(e) => updateAiModel('geminiKey', e.target.value)}
                      error={errors.geminiKey}
                      className="pl-10"
                    />
                    <Key className="absolute left-3 top-9 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Claude API Key"
                      type="password"
                      placeholder="sk-ant-..."
                      value={formData.aiModel.claudeKey || ''}
                      onChange={(e) => updateAiModel('claudeKey', e.target.value)}
                      error={errors.claudeKey}
                      className="pl-10"
                    />
                    <Key className="absolute left-3 top-9 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>

                  <div className="relative">
                    <Input
                      label="SSM API Key"
                      type="password"
                      placeholder="sk-ant-..."
                      value={formData.aiModel.ssmKey || ''}
                      onChange={(e) => updateAiModel('ssmKey', e.target.value)}
                      error={errors.ssmKey}
                      className="pl-10"
                    />
                    <Key className="absolute left-3 top-9 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> API keys are encrypted and stored securely. You only need to provide the key for your selected AI model.
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Advanced Settings</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showAdvancedSettings ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showAdvancedSettings ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="space-y-6">
                  {/* Prompt Settings */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                      Prompt Settings
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Prompt for EXA Company Information Extraction
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows={4}
                        placeholder="Enter your custom prompt for extracting company information using EXA. This prompt will be used to analyze and identify company-related data from conversations..."
                        value={formData.advancedSettings?.exaPrompt || ''}
                        onChange={(e) => updateAdvancedSettings('exaPrompt', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional. Leave empty to use system defaults.
                      </p>
                    </div>
                  </div>

                  {/* Icebreaker Personalization Prompts */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                      Icebreaker Personalization Prompts
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          System Prompt
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          rows={4}
                          placeholder="Enter the system instructions for personalizing icebreakers..."
                          value={formData.advancedSettings?.icebreakerSystemPrompt || ''}
                          onChange={(e) => updateAdvancedSettings('icebreakerSystemPrompt', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Optional. System-level instructions for icebreaker generation.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Prompt
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          rows={4}
                          placeholder="Enter the user context for icebreaker generation..."
                          value={formData.advancedSettings?.icebreakerUserPrompt || ''}
                          onChange={(e) => updateAdvancedSettings('icebreakerUserPrompt', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Optional. User-specific context for icebreaker personalization.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>Note:</strong> All fields are optional. Empty fields will use system defaults. Custom prompts will take precedence when provided.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Company Targeting Settings - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowAdvancedTargeting(!showAdvancedTargeting)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Advanced Company Targeting Settings</span>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showAdvancedTargeting ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showAdvancedTargeting ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="space-y-4 sm:space-y-6">
                  {formData.companyTargeting.map((targeting, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 transition-all duration-200 hover:shadow-md">
                      <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                        Company Size Range {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Company Size"
                          value={targeting.companySize}
                          onChange={(e) => updateCompanyTargeting(index, 'companySize', e.target.value)}
                          placeholder="e.g., 1-10"
                        />
                        <Input
                          label="Number of Contacts"
                          type="number"
                          min="1"
                          value={targeting.numberOfContacts}
                          onChange={(e) => updateCompanyTargeting(index, 'numberOfContacts', parseInt(e.target.value) || 1)}
                          style={{ 
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none'
                          }}
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div>
                          <Input
                            label="Primary Target Roles"
                            value={targeting.primaryTargetRoles}
                            onChange={(e) => updateCompanyTargeting(index, 'primaryTargetRoles', e.target.value)}
                            placeholder="CEO, Founder"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate roles with commas</p>
                        </div>
                        <div>
                          <Input
                            label="Secondary Target Roles"
                            value={targeting.secondaryTargetRoles}
                            onChange={(e) => updateCompanyTargeting(index, 'secondaryTargetRoles', e.target.value)}
                            placeholder="Owner, Director"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate roles with commas</p>
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
            Next: Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectSettingsStep;