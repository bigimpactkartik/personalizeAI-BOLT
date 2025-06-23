import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { ProjectCreate } from '../../types/project';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import projectService from '../../services/projectService';

interface ProjectCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
  onError: (error: string) => void;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  onError
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    user_id: user?.uuid || '',
    description: '',
    sheet_link: '',
    no_of_mailbox: 1,
    response_sheet_link: '',
    emails_per_mailbox: 30,
    email_per_contact: 1,
    batch_duration_days: 2,
    contact_limit_very_small: 2,
    contact_limit_small_company: 3,
    contact_limit_medium_company: 4,
    contact_limit_large_company: 5,
    contact_limit_enterprise: 6,
    company_size_very_small_max: 10,
    company_size_small_max: 50,
    company_size_medium_max: 200,
    company_size_large_max: 1000,
    company_size_enterprise_min: 1001,
    days_between_contacts: 3,
    follow_up_cycle_days: 7,
    target_departments: [],
    excluded_departments: [],
    seniority_tier_1: [],
    seniority_tier_2: [],
    seniority_tier_3: [],
    seniority_excluded: []
  });

  const [departmentInput, setDepartmentInput] = useState('');
  const [excludedDepartmentInput, setExcludedDepartmentInput] = useState('');
  const [seniorityTier1Input, setSeniorityTier1Input] = useState('');
  const [seniorityTier2Input, setSeniorityTier2Input] = useState('');
  const [seniorityTier3Input, setSeniorityTier3Input] = useState('');
  const [seniorityExcludedInput, setSeniorityExcludedInput] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.sheet_link?.trim()) {
      newErrors.sheet_link = 'Sheet link is required';
    }

    if (formData.no_of_mailbox < 1) {
      newErrors.no_of_mailbox = 'At least 1 mailbox is required';
    }

    if (formData.emails_per_mailbox < 1) {
      newErrors.emails_per_mailbox = 'At least 1 email per mailbox is required';
    }

    if (formData.batch_duration_days < 1) {
      newErrors.batch_duration_days = 'Batch duration must be at least 1 day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const project = await projectService.createProject({
        ...formData,
        user_id: user?.uuid || ''
      });
      
      onProjectCreated(project);
      onClose();
      resetForm();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      user_id: user?.uuid || '',
      description: '',
      sheet_link: '',
      no_of_mailbox: 1,
      response_sheet_link: '',
      emails_per_mailbox: 30,
      email_per_contact: 1,
      batch_duration_days: 2,
      contact_limit_very_small: 2,
      contact_limit_small_company: 3,
      contact_limit_medium_company: 4,
      contact_limit_large_company: 5,
      contact_limit_enterprise: 6,
      company_size_very_small_max: 10,
      company_size_small_max: 50,
      company_size_medium_max: 200,
      company_size_large_max: 1000,
      company_size_enterprise_min: 1001,
      days_between_contacts: 3,
      follow_up_cycle_days: 7,
      target_departments: [],
      excluded_departments: [],
      seniority_tier_1: [],
      seniority_tier_2: [],
      seniority_tier_3: [],
      seniority_excluded: []
    });
    setErrors({});
    setDepartmentInput('');
    setExcludedDepartmentInput('');
    setSeniorityTier1Input('');
    setSeniorityTier2Input('');
    setSeniorityTier3Input('');
    setSeniorityExcludedInput('');
  };

  const handleInputChange = (field: keyof ProjectCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addToArray = (field: keyof ProjectCreate, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
      setValue('');
    }
  };

  const removeFromArray = (field: keyof ProjectCreate, index: number) => {
    const currentArray = formData[field] as string[];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const renderArrayInput = (
    field: keyof ProjectCreate,
    label: string,
    inputValue: string,
    setInputValue: (value: string) => void,
    placeholder: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray(field, inputValue, setInputValue);
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addToArray(field, inputValue, setInputValue)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {(formData[field] as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData[field] as string[]).map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeFromArray(field, index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      size="xl"
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter project name"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter project description (optional)"
            />
          </div>
          
          <Input
            label="Sheet Link"
            value={formData.sheet_link}
            onChange={(e) => handleInputChange('sheet_link', e.target.value)}
            error={errors.sheet_link}
            placeholder="https://docs.google.com/spreadsheets/..."
            required
          />
        </div>

        {/* Email Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Email Configuration
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Number of Mailboxes"
              type="number"
              min="1"
              value={formData.no_of_mailbox}
              onChange={(e) => handleInputChange('no_of_mailbox', parseInt(e.target.value) || 1)}
              error={errors.no_of_mailbox}
            />
            
            <Input
              label="Emails per Mailbox"
              type="number"
              min="1"
              value={formData.emails_per_mailbox}
              onChange={(e) => handleInputChange('emails_per_mailbox', parseInt(e.target.value) || 1)}
              error={errors.emails_per_mailbox}
            />
            
            <Input
              label="Email per Contact"
              type="number"
              min="1"
              value={formData.email_per_contact}
              onChange={(e) => handleInputChange('email_per_contact', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Batch Duration (Days)"
              type="number"
              min="1"
              value={formData.batch_duration_days}
              onChange={(e) => handleInputChange('batch_duration_days', parseInt(e.target.value) || 1)}
              error={errors.batch_duration_days}
            />
          </div>
        </div>

        {/* Company Size Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Contact Limits by Company Size
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Very Small Companies"
              type="number"
              min="1"
              value={formData.contact_limit_very_small}
              onChange={(e) => handleInputChange('contact_limit_very_small', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Small Companies"
              type="number"
              min="1"
              value={formData.contact_limit_small_company}
              onChange={(e) => handleInputChange('contact_limit_small_company', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Medium Companies"
              type="number"
              min="1"
              value={formData.contact_limit_medium_company}
              onChange={(e) => handleInputChange('contact_limit_medium_company', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Large Companies"
              type="number"
              min="1"
              value={formData.contact_limit_large_company}
              onChange={(e) => handleInputChange('contact_limit_large_company', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Enterprise Companies"
              type="number"
              min="1"
              value={formData.contact_limit_enterprise}
              onChange={(e) => handleInputChange('contact_limit_enterprise', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Company Size Thresholds */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Company Size Thresholds
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Very Small Max"
              type="number"
              min="1"
              value={formData.company_size_very_small_max}
              onChange={(e) => handleInputChange('company_size_very_small_max', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Small Max"
              type="number"
              min="1"
              value={formData.company_size_small_max}
              onChange={(e) => handleInputChange('company_size_small_max', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Medium Max"
              type="number"
              min="1"
              value={formData.company_size_medium_max}
              onChange={(e) => handleInputChange('company_size_medium_max', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Large Max"
              type="number"
              min="1"
              value={formData.company_size_large_max}
              onChange={(e) => handleInputChange('company_size_large_max', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Enterprise Min"
              type="number"
              min="1"
              value={formData.company_size_enterprise_min}
              onChange={(e) => handleInputChange('company_size_enterprise_min', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Timing Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Timing Configuration
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Days Between Contacts"
              type="number"
              min="1"
              value={formData.days_between_contacts}
              onChange={(e) => handleInputChange('days_between_contacts', parseInt(e.target.value) || 1)}
            />
            
            <Input
              label="Follow-up Cycle (Days)"
              type="number"
              min="1"
              value={formData.follow_up_cycle_days}
              onChange={(e) => handleInputChange('follow_up_cycle_days', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Targeting Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Targeting Configuration
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderArrayInput(
              'target_departments',
              'Target Departments',
              departmentInput,
              setDepartmentInput,
              'e.g., Engineering, Marketing'
            )}
            
            {renderArrayInput(
              'excluded_departments',
              'Excluded Departments',
              excludedDepartmentInput,
              setExcludedDepartmentInput,
              'e.g., HR, Legal'
            )}
          </div>
        </div>

        {/* Seniority Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Seniority Configuration
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderArrayInput(
              'seniority_tier_1',
              'Seniority Tier 1 (Highest Priority)',
              seniorityTier1Input,
              setSeniorityTier1Input,
              'e.g., CEO, CTO, VP'
            )}
            
            {renderArrayInput(
              'seniority_tier_2',
              'Seniority Tier 2',
              seniorityTier2Input,
              setSeniorityTier2Input,
              'e.g., Director, Manager'
            )}
            
            {renderArrayInput(
              'seniority_tier_3',
              'Seniority Tier 3',
              seniorityTier3Input,
              setSeniorityTier3Input,
              'e.g., Senior, Lead'
            )}
            
            {renderArrayInput(
              'seniority_excluded',
              'Excluded Seniority',
              seniorityExcludedInput,
              setSeniorityExcludedInput,
              'e.g., Intern, Assistant'
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectCreationForm;