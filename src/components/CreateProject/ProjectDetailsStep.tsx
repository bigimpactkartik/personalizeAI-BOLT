import React, { useState } from 'react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

interface ProjectDetailsStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({
  formData,
  updateFormData,
  onNext
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = 'Target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fade-in-up">
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
          <p className="text-gray-600">
            Provide basic information about your cold email campaign
          </p>
        </div>

        <div className="space-y-6">
          <Input
            label="Project Name"
            placeholder="e.g., Tech Startup Outreach Q1 2024"
            value={formData.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            error={errors.projectName}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                errors.description ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              rows={4}
              placeholder="Describe your campaign goals, target companies, and what you're trying to achieve..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 slide-in">{errors.description}</p>
            )}
          </div>

          <Input
            label="Target Audience"
            placeholder="e.g., SaaS founders, E-commerce managers, Tech executives"
            value={formData.targetAudience}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
            error={errors.targetAudience}
            helperText="Describe your ideal customer profile and who you're targeting"
            required
          />
        </div>

        <div className="flex justify-end mt-8">
          <Button onClick={handleNext} size="lg" className="transition-all duration-200">
            Next: Upload Data
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailsStep;