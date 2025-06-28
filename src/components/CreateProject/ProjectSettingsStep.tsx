import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Key, Users, Target, Clock, MessageSquare, Calculator, Info, Edit, Eye } from 'lucide-react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Card from '../UI/Card';
import Modal from '../UI/Modal';

interface ProjectSettingsStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Backend default values from the schema
const BACKEND_DEFAULTS = {
  no_of_mailbox: 1,
  emails_per_mailbox: 30,
  email_per_contact: 1,
  batch_duration_days: 2,
  contact_limit_very_small: 2,
  contact_limit_small_company: 4,
  contact_limit_medium_company: 8,
  contact_limit_large_company: 10,
  contact_limit_enterprise: 0,
  company_size_very_small_max: 10,
  company_size_small_max: 50,
  company_size_medium_max: 200,
  company_size_large_max: 1000,
  company_size_enterprise_min: 1001,
  days_between_contacts: 3,
  follow_up_cycle_days: 7,
  
  // Default role arrays
  company_size_very_small_primary_target_roles: ["ceo", "founder", "co-founder", "owner", "president"],
  company_size_small_primary_target_roles: ["ceo", "founder", "co-founder", "vp", "vice president"],
  company_size_medium_primary_target_roles: ["director", "vp", "vice president", "head of"],
  company_size_large_primary_target_roles: ["director", "head of", "senior director", "vp", "vice president"],
  company_size_enterprise_primary_target_roles: ["ABM Territory"],
  
  company_size_very_small_secondary_target_roles: ["director", "head of", "vp", "vice president"],
  company_size_small_secondary_target_roles: ["director", "head of", "senior manager", "manager"],
  company_size_medium_secondary_target_roles: ["senior manager", "manager", "senior director"],
  company_size_large_secondary_target_roles: ["VP", "Senior Manager"],
  company_size_enterprise_secondary_target_roles: ["Contact for ABM strategy"],
  
  company_size_very_small_exclusion_roles: ["intern", "assistant", "coordinator", "analyst"],
  company_size_small_exclusion_roles: ["Intern", "Assistant"],
  company_size_medium_exclusion_roles: ["CEO", "Founder", "Analyst"],
  company_size_large_exclusion_roles: ["CEO", "President", "Analyst"],
  company_size_enterprise_exclusion_roles: ["All"],
  
  company_size_very_small_target_departments: ["All"],
  company_size_small_target_departments: ["All"],
  company_size_medium_target_departments: ["Sales", "Marketing", "Operations", "Growth"],
  company_size_large_target_departments: ["Sales", "Marketing", "Operations", "Growth"],
  company_size_enterprise_target_departments: ["All"],
  
  company_size_very_small_exclusion_departments: ["None"],
  company_size_small_exclusion_departments: ["None"],
  company_size_medium_exclusion_departments: ["HR", "Legal", "Finance", "Accounting"],
  company_size_large_exclusion_departments: ["HR", "Legal", "Finance", "Accounting"],
  company_size_enterprise_exclusion_departments: ["N/A"]
};

// Default prompt texts
const DEFAULT_PROMPTS = {
  exa_website_summary: `You are an expert business analyst. 
Given any company name and a brief description or website data, generate a clear, structured company summary with the following format and tone. 
Keep it concise, factual, and tailored for professional outreach.
FORMAT TO FOLLOW:
COMPANY: [Company Name] – [Brief description: what the company is, what it does]. 
Industry: [Industry name]. 
Size/Locations: [Estimated size, revenue or AUM if relevant, and geographic focus or HQ].
SERVICES: [What products/services the company provides]. 
Target customers: [Type of clients the company serves]. 
Geographic reach: [Where they operate].
BUSINESS: Revenue model: [How the company makes money]. 
Key achievements/metrics: [Any measurable accomplishments]. 
Recent developments: [Recent fundraising, partnerships, product launches, etc.].
OUTREACH ANGLES:
Challenge: [A possible problem or opportunity the company might be facing].
Growth: [How your solution can help them grow, scale, or optimize].
Advantage: [A unique strength you/your firm offers that fits their goals].
Make sure all information is fact-based, and infer only when context clearly allows. 
Use a confident, advisory tone, suitable for B2B strategy or consulting outreach.`,

  icebreaker_system: `ROLE
You are an expert at writing authentic peer-to-peer compliments for B2B outreach that sound like genuine industry recognition.

# CORE RULES

Write like a knowledgeable industry peer giving sincere recognition
Use casual, conversational tone - no formal sales language
Combine multiple impressive facts into one cohesive observation
Focus on operational excellence, strategic positioning, or market impact
Keep under 20 words total
NO sales questions, asks, or hints
NO exclamation marks - sound confident, not excited
Don't start with "I" or use first person

# CRITICAL: FACT-ONLY RULE

ONLY use explicit facts from the provided summary
NEVER add numbers, percentages, locations, or achievements not mentioned
If no specifics given, focus on general strategic observations

# TONE EXAMPLES

"Building across 8 states with consistent quality and competitive rates - that's operational excellence"
"Multi-market expansion while keeping agent quality high - that's rare in real estate"
"Quick move-in inventory strategy across multiple states - you're solving real buyer pain points"`,

  icebreaker_user: `Create 3 peer-to-peer compliment variations that combine their most impressive facts into single observations.

STRUCTURE: [Strategic insight] + [specific accomplishment] + [Use humanised company name somewhere appropriately in the sentence] + [appreciation ending]

## Focus on:

Operational scale/complexity they've mastered
Smart strategic positioning in their market
Impressive execution across multiple dimensions

## Since this is for AI lead qualification services, prioritize compliments about:

Multi-location operations
Customer experience improvements
Growth/expansion achievements
Innovative approaches to traditional problems

## Humanization of Company Name

Simplify the company name to be referred in the email with ease
Shorten it like how a human would do with in the company
Keep the length max to 1-2 words as much as possible`
};

const ProjectSettingsStep: React.FC<ProjectSettingsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious
}) => {
  const [showCompanyTargeting, setShowCompanyTargeting] = useState(false);
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<{
    key: string;
    title: string;
    value: string;
    defaultValue: string;
  } | null>(null);

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const aiModelOptions = [
    { value: 'openai-gpt4', label: 'OpenAI GPT-4', description: 'Most versatile and creative' },
    { value: 'openai-gpt4o', label: 'OpenAI GPT-4o', description: 'Optimized for speed and efficiency' },
    { value: 'openai-gpt4o-mini', label: 'OpenAI GPT-4o Mini', description: 'Lightweight and fast' },
    { value: 'openai-gpt41-nano', label: 'OpenAI GPT-4.1 Nano', description: 'Ultra-efficient model' },
    { value: 'openai-gpt35', label: 'OpenAI GPT-3.5 Turbo', description: 'Fast and cost-effective' },
    { value: 'gemini-pro', label: 'Google Gemini Pro', description: 'Great for research and analysis' },
    { value: 'gemini-ultra', label: 'Google Gemini Ultra', description: 'Most capable Gemini model' },
    { value: 'claude-opus', label: 'Anthropic Claude 3 Opus', description: 'Most powerful Claude model' },
    { value: 'claude-sonnet', label: 'Anthropic Claude 3 Sonnet', description: 'Balanced performance and speed' },
    { value: 'claude-haiku', label: 'Anthropic Claude 3 Haiku', description: 'Fastest Claude model' }
  ];

  const getApiKeyLabel = (provider: string) => {
    if (provider.startsWith('openai')) return 'OpenAI API Key';
    if (provider.startsWith('gemini')) return 'Google Gemini API Key';
    if (provider.startsWith('claude')) return 'Anthropic Claude API Key';
    return 'API Key';
  };

  const getApiKeyField = (provider: string) => {
    if (provider.startsWith('openai')) return 'openaiKey';
    if (provider.startsWith('gemini')) return 'geminiKey';
    if (provider.startsWith('claude')) return 'claudeKey';
    return 'openaiKey';
  };

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

    // Validate API key for selected model
    const apiKeyField = getApiKeyField(formData.aiModel.provider);
    if (!formData.aiModel[apiKeyField as keyof typeof formData.aiModel]) {
      newErrors.apiKey = `${getApiKeyLabel(formData.aiModel.provider)} is required`;
    }

    // Validate EXA API key
    if (!formData.aiModel.exaKey) {
      newErrors.exaKey = 'EXA API Key is required';
    }

    // Validate SSM API key
    if (!formData.aiModel.ssmKey) {
      newErrors.ssmKey = 'SSM API Key is required';
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
          ...formData.companyTargetingBySize?.[companySize as keyof typeof formData.companyTargetingBySize],
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

  const openPromptModal = (key: string, title: string, defaultValue: string) => {
    const currentValue = formData.prompts?.[key as keyof typeof formData.prompts] || '';
    setCurrentPrompt({
      key,
      title,
      value: currentValue,
      defaultValue
    });
    setShowPromptModal(true);
  };

  const savePrompt = () => {
    if (currentPrompt) {
      updatePrompts(currentPrompt.key, currentPrompt.value);
      setShowPromptModal(false);
      setCurrentPrompt(null);
    }
  };

  const companySizes = [
    { 
      key: 'verySmall', 
      label: 'Very Small (1-10)', 
      contactLimit: 'verySmall',
      defaultPrimary: BACKEND_DEFAULTS.company_size_very_small_primary_target_roles,
      defaultSecondary: BACKEND_DEFAULTS.company_size_very_small_secondary_target_roles,
      defaultExclusion: BACKEND_DEFAULTS.company_size_very_small_exclusion_roles,
      defaultTargetDepts: BACKEND_DEFAULTS.company_size_very_small_target_departments,
      defaultExclusionDepts: BACKEND_DEFAULTS.company_size_very_small_exclusion_departments
    },
    { 
      key: 'small', 
      label: 'Small (11-50)', 
      contactLimit: 'smallCompany',
      defaultPrimary: BACKEND_DEFAULTS.company_size_small_primary_target_roles,
      defaultSecondary: BACKEND_DEFAULTS.company_size_small_secondary_target_roles,
      defaultExclusion: BACKEND_DEFAULTS.company_size_small_exclusion_roles,
      defaultTargetDepts: BACKEND_DEFAULTS.company_size_small_target_departments,
      defaultExclusionDepts: BACKEND_DEFAULTS.company_size_small_exclusion_departments
    },
    { 
      key: 'medium', 
      label: 'Medium (51-200)', 
      contactLimit: 'mediumCompany',
      defaultPrimary: BACKEND_DEFAULTS.company_size_medium_primary_target_roles,
      defaultSecondary: BACKEND_DEFAULTS.company_size_medium_secondary_target_roles,
      defaultExclusion: BACKEND_DEFAULTS.company_size_medium_exclusion_roles,
      defaultTargetDepts: BACKEND_DEFAULTS.company_size_medium_target_departments,
      defaultExclusionDepts: BACKEND_DEFAULTS.company_size_medium_exclusion_departments
    },
    { 
      key: 'large', 
      label: 'Large (201-1000)', 
      contactLimit: 'largeCompany',
      defaultPrimary: BACKEND_DEFAULTS.company_size_large_primary_target_roles,
      defaultSecondary: BACKEND_DEFAULTS.company_size_large_secondary_target_roles,
      defaultExclusion: BACKEND_DEFAULTS.company_size_large_exclusion_roles,
      defaultTargetDepts: BACKEND_DEFAULTS.company_size_large_target_departments,
      defaultExclusionDepts: BACKEND_DEFAULTS.company_size_large_exclusion_departments
    },
    { 
      key: 'enterprise', 
      label: 'Enterprise (1000+)', 
      contactLimit: 'enterprise',
      defaultPrimary: BACKEND_DEFAULTS.company_size_enterprise_primary_target_roles,
      defaultSecondary: BACKEND_DEFAULTS.company_size_enterprise_secondary_target_roles,
      defaultExclusion: BACKEND_DEFAULTS.company_size_enterprise_exclusion_roles,
      defaultTargetDepts: BACKEND_DEFAULTS.company_size_enterprise_target_departments,
      defaultExclusionDepts: BACKEND_DEFAULTS.company_size_enterprise_exclusion_departments
    }
  ];

  const DefaultValueIndicator: React.FC<{ value: any }> = ({ value }) => (
    <div className="flex items-center space-x-2 mt-1">
      <Info className="h-3 w-3 text-blue-500" />
      <span className="text-xs text-blue-600">
        Default: {Array.isArray(value) ? value.join(', ') : value}
      </span>
    </div>
  );

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Configure your email capacity, AI model, and targeting settings. Default values are shown for reference.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. AI Model Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Model Configuration</h3>
                <p className="text-sm text-gray-600">Select and configure the AI model for your project needs</p>
              </div>
            </div>
            
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

              {/* API Key Input - Shows when model is selected */}
              {formData.aiModel.provider && (
                <div className="slide-in">
                  <Input
                    label={getApiKeyLabel(formData.aiModel.provider)}
                    type="password"
                    placeholder={`Enter your ${getApiKeyLabel(formData.aiModel.provider)}`}
                    value={formData.aiModel[getApiKeyField(formData.aiModel.provider) as keyof typeof formData.aiModel] || ''}
                    onChange={(e) => updateAiModel(getApiKeyField(formData.aiModel.provider), e.target.value)}
                    error={errors.apiKey}
                    required
                    helperText="Your API key will be securely stored and used only for this project"
                  />
                </div>
              )}

              {/* EXA API Key */}
              <div>
                <Input
                  label="EXA API Key"
                  type="password"
                  placeholder="Enter your EXA API Key"
                  value={formData.aiModel.exaKey || ''}
                  onChange={(e) => updateAiModel('exaKey', e.target.value)}
                  error={errors.exaKey}
                  required
                  helperText="Required for company information extraction"
                />
              </div>

              {/* SSM API Key */}
              <div>
                <Input
                  label="SSM API Key"
                  type="password"
                  placeholder="Enter your SSM API Key"
                  value={formData.aiModel.ssmKey || ''}
                  onChange={(e) => updateAiModel('ssmKey', e.target.value)}
                  error={errors.ssmKey}
                  required
                  helperText="Required for secure storage and management"
                />
              </div>
            </div>
          </div>

          {/* 2. Email Capacity Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calculator className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Capacity Settings</h3>
                <p className="text-sm text-gray-600">Define daily and monthly email sending limits</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.no_of_mailbox} />
              </div>
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.emails_per_mailbox} />
              </div>
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.batch_duration_days} />
              </div>
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.email_per_contact} />
              </div>
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

          {/* 3. Contact Limits by Company Size */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Limits by Company Size</h3>
                <p className="text-sm text-gray-600">Set maximum contacts based on target company size</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Very Small (1-10)"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.contactLimits?.verySmall || 0}
                  onChange={(e) => updateContactLimits('verySmall', parseInt(e.target.value) || 0)}
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none'
                  }}
                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DefaultValueIndicator value={BACKEND_DEFAULTS.contact_limit_very_small} />
              </div>
              <div>
                <Input
                  label="Small (11-50)"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.contactLimits?.smallCompany || 0}
                  onChange={(e) => updateContactLimits('smallCompany', parseInt(e.target.value) || 0)}
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none'
                  }}
                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DefaultValueIndicator value={BACKEND_DEFAULTS.contact_limit_small_company} />
              </div>
              <div>
                <Input
                  label="Medium (51-200)"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.contactLimits?.mediumCompany || 0}
                  onChange={(e) => updateContactLimits('mediumCompany', parseInt(e.target.value) || 0)}
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none'
                  }}
                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DefaultValueIndicator value={BACKEND_DEFAULTS.contact_limit_medium_company} />
              </div>
              <div>
                <Input
                  label="Large (201-1000)"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.contactLimits?.largeCompany || 0}
                  onChange={(e) => updateContactLimits('largeCompany', parseInt(e.target.value) || 0)}
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none'
                  }}
                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DefaultValueIndicator value={BACKEND_DEFAULTS.contact_limit_large_company} />
              </div>
              <div>
                <Input
                  label="Enterprise (1000+)"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.contactLimits?.enterprise || 0}
                  onChange={(e) => updateContactLimits('enterprise', parseInt(e.target.value) || 0)}
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none'
                  }}
                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DefaultValueIndicator value={BACKEND_DEFAULTS.contact_limit_enterprise} />
              </div>
            </div>
          </div>

          {/* 4. Company Targeting Settings - Collapsible */}
          <div className="transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setShowCompanyTargeting(!showCompanyTargeting)}
              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left bg-gray-50 rounded-lg p-6"
            >
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Company Targeting Settings</h3>
                <p className="text-sm text-gray-600">Configure company targeting criteria and preferences</p>
              </div>
              <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 ml-auto transition-transform duration-300 ${
                showCompanyTargeting ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showCompanyTargeting ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 transform transition-transform duration-300">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These targeting settings are optional. If left empty, we will use our optimized default targeting that works well for most use cases.
                  </p>
                </div>
                
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
                          <DefaultValueIndicator value={size.defaultPrimary} />
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
                          <DefaultValueIndicator value={size.defaultSecondary} />
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
                          <DefaultValueIndicator value={size.defaultExclusion} />
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
                            <DefaultValueIndicator value={size.defaultTargetDepts} />
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
                            <DefaultValueIndicator value={size.defaultExclusionDepts} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Timing Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Timing Settings</h3>
                <p className="text-sm text-gray-600">Schedule and manage email sending timeframes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.days_between_contacts} />
              </div>
              <div>
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
                <DefaultValueIndicator value={BACKEND_DEFAULTS.follow_up_cycle_days} />
              </div>
            </div>
          </div>

          {/* 6. AI Prompt Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="h-5 w-5 text-pink-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Prompt Settings</h3>
                <p className="text-sm text-gray-600">Customize AI interaction prompts and behaviors</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These prompts are optional. If left empty, we will use our optimized default prompts that work well for most use cases.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Custom Prompt for EXA Company Information Extraction</h4>
                  <p className="text-sm text-gray-600">Configure how AI extracts company information</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPromptModal('customPromptForExaCompanyInformationExtraction', 'Custom Prompt for EXA Company Information Extraction', DEFAULT_PROMPTS.exa_website_summary)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View or Edit
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Icebreaker Personalized System Prompt</h4>
                  <p className="text-sm text-gray-600">Define system behavior for icebreaker generation</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPromptModal('icebreakerPersonalizedSystemPrompt', 'Icebreaker Personalized System Prompt', DEFAULT_PROMPTS.icebreaker_system)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View or Edit
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Icebreaker Personalized User Prompt</h4>
                  <p className="text-sm text-gray-600">Customize user instructions for icebreaker creation</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPromptModal('icebreakerPersonalizedUserPrompt', 'Icebreaker Personalized User Prompt', DEFAULT_PROMPTS.icebreaker_user)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View or Edit
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
          <Button variant="outline" onClick={handlePrevious} className="w-full sm:w-auto transition-all duration-200">
            Previous
          </Button>
          <Button onClick={handleNext} size="lg" className="w-full sm:w-auto transition-all duration-200">
            Review & Create
          </Button>
        </div>
      </Card>

      {/* Prompt Modal */}
      <Modal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        title={currentPrompt?.title || 'Edit Prompt'}
        size="2xl"
      >
        {currentPrompt && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={12}
                placeholder="Enter your custom prompt or leave empty to use default"
                value={currentPrompt.value}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, value: e.target.value })}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Default Prompt</h4>
              <div className="text-sm text-gray-700 max-h-40 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                {currentPrompt.defaultValue}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPromptModal(false)}>
                Cancel
              </Button>
              <Button onClick={savePrompt}>
                Save Prompt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectSettingsStep;