import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { FeedbackFormData, IMPROVEMENT_ASPECTS, ImprovementAspect } from '../../types/feedback';
import Button from '../UI/Button';
import Input from '../UI/Input';
import StarRating from '../UI/StarRating';
import Checkbox from '../UI/Checkbox';
import Card from '../UI/Card';

interface ProjectFeedbackFormProps {
  projectId: string;
  projectName: string;
  onSubmit: (feedback: FeedbackFormData) => Promise<void>;
  onCancel?: () => void;
}

const ProjectFeedbackForm: React.FC<ProjectFeedbackFormProps> = ({
  projectId,
  projectName,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    overallSatisfactionRating: 0,
    experienceDescription: '',
    processingSpeedRating: 0,
    systemResponsivenessRating: 0,
    userInterfaceRating: 0,
    metRequirements: true,
    requirementsExplanation: '',
    deliverablesOnTime: true,
    overallQualityRating: 0,
    desiredFeatures: '',
    improvementAspects: [],
    improvementOther: '',
    additionalComments: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Overall Project Experience validation
    if (formData.overallSatisfactionRating === 0) {
      newErrors.overallSatisfactionRating = 'Overall satisfaction rating is required';
    }
    if (!formData.experienceDescription.trim()) {
      newErrors.experienceDescription = 'Experience description is required';
    } else if (formData.experienceDescription.length > 500) {
      newErrors.experienceDescription = 'Experience description must be 500 characters or less';
    }

    // Project Performance validation
    if (formData.processingSpeedRating === 0) {
      newErrors.processingSpeedRating = 'Processing speed rating is required';
    }
    if (formData.systemResponsivenessRating === 0) {
      newErrors.systemResponsivenessRating = 'System responsiveness rating is required';
    }
    if (formData.userInterfaceRating === 0) {
      newErrors.userInterfaceRating = 'User interface rating is required';
    }

    // Quality Assessment validation
    if (!formData.requirementsExplanation.trim()) {
      newErrors.requirementsExplanation = 'Please explain how the project met or didn\'t meet your requirements';
    }
    if (formData.overallQualityRating === 0) {
      newErrors.overallQualityRating = 'Overall quality rating is required';
    }

    // Areas for Improvement validation
    if (!formData.desiredFeatures.trim()) {
      newErrors.desiredFeatures = 'Please describe features you\'d like to see added';
    } else if (formData.desiredFeatures.length > 300) {
      newErrors.desiredFeatures = 'Desired features must be 300 characters or less';
    }

    if (formData.improvementAspects.includes('Other') && !formData.improvementOther.trim()) {
      newErrors.improvementOther = 'Please specify other improvement aspects';
    }

    // Additional Comments validation
    if (formData.additionalComments.length > 1000) {
      newErrors.additionalComments = 'Additional comments must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ general: 'Failed to submit feedback. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImprovementAspectChange = (aspect: ImprovementAspect, checked: boolean) => {
    const currentAspects = formData.improvementAspects;
    const newAspects = checked 
      ? [...currentAspects, aspect]
      : currentAspects.filter(a => a !== aspect);
    
    handleInputChange('improvementAspects', newAspects);
    
    // Clear "Other" field if "Other" is unchecked
    if (aspect === 'Other' && !checked) {
      handleInputChange('improvementOther', '');
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
        <p className="text-gray-600 mb-6">
          Your feedback has been submitted successfully. We appreciate your input and will use it to improve our services.
        </p>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Project Feedback</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Help us improve by sharing your experience with "{projectName}"
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-600 text-sm">{errors.general}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Overall Project Experience */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Overall Project Experience
          </h3>
          
          <StarRating
            label="Rate your satisfaction with the project execution"
            rating={formData.overallSatisfactionRating}
            onRatingChange={(rating) => handleInputChange('overallSatisfactionRating', rating)}
            error={errors.overallSatisfactionRating}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How would you describe your experience? <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                errors.experienceDescription ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              rows={4}
              maxLength={500}
              placeholder="Describe your overall experience with this project..."
              value={formData.experienceDescription}
              onChange={(e) => handleInputChange('experienceDescription', e.target.value)}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.experienceDescription ? (
                <p className="text-sm text-red-600">{errors.experienceDescription}</p>
              ) : (
                <span></span>
              )}
              <span className="text-xs text-gray-500">
                {formData.experienceDescription.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Project Performance */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Project Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarRating
              label="Processing Speed"
              rating={formData.processingSpeedRating}
              onRatingChange={(rating) => handleInputChange('processingSpeedRating', rating)}
              error={errors.processingSpeedRating}
              required
            />
            
            <StarRating
              label="System Responsiveness"
              rating={formData.systemResponsivenessRating}
              onRatingChange={(rating) => handleInputChange('systemResponsivenessRating', rating)}
              error={errors.systemResponsivenessRating}
              required
            />
            
            <StarRating
              label="User Interface"
              rating={formData.userInterfaceRating}
              onRatingChange={(rating) => handleInputChange('userInterfaceRating', rating)}
              error={errors.userInterfaceRating}
              required
            />
          </div>
        </div>

        {/* Quality Assessment */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Quality Assessment
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Did the project meet your requirements?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metRequirements"
                    checked={formData.metRequirements === true}
                    onChange={() => handleInputChange('metRequirements', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metRequirements"
                    checked={formData.metRequirements === false}
                    onChange={() => handleInputChange('metRequirements', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.metRequirements ? 'How did it meet your requirements?' : 'Why didn\'t it meet your requirements?'} <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.requirementsExplanation ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                rows={3}
                placeholder="Please explain..."
                value={formData.requirementsExplanation}
                onChange={(e) => handleInputChange('requirementsExplanation', e.target.value)}
              />
              {errors.requirementsExplanation && (
                <p className="mt-1 text-sm text-red-600">{errors.requirementsExplanation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Were deliverables completed on time?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliverablesOnTime"
                    checked={formData.deliverablesOnTime === true}
                    onChange={() => handleInputChange('deliverablesOnTime', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliverablesOnTime"
                    checked={formData.deliverablesOnTime === false}
                    onChange={() => handleInputChange('deliverablesOnTime', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <StarRating
              label="Rate the overall quality"
              rating={formData.overallQualityRating}
              onRatingChange={(rating) => handleInputChange('overallQualityRating', rating)}
              error={errors.overallQualityRating}
              required
            />
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Areas for Improvement
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What features would you like to see added? <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                errors.desiredFeatures ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              rows={3}
              maxLength={300}
              placeholder="Describe features or improvements you'd like to see..."
              value={formData.desiredFeatures}
              onChange={(e) => handleInputChange('desiredFeatures', e.target.value)}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.desiredFeatures ? (
                <p className="text-sm text-red-600">{errors.desiredFeatures}</p>
              ) : (
                <span></span>
              )}
              <span className="text-xs text-gray-500">
                {formData.desiredFeatures.length}/300
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Which aspects need improvement? (Select all that apply)
            </label>
            <div className="space-y-3">
              {IMPROVEMENT_ASPECTS.map((aspect) => (
                <Checkbox
                  key={aspect}
                  checked={formData.improvementAspects.includes(aspect)}
                  onChange={(checked) => handleImprovementAspectChange(aspect, checked)}
                  label={aspect}
                />
              ))}
            </div>
            
            {formData.improvementAspects.includes('Other') && (
              <div className="mt-4">
                <Input
                  placeholder="Please specify other improvement aspects"
                  value={formData.improvementOther}
                  onChange={(e) => handleInputChange('improvementOther', e.target.value)}
                  error={errors.improvementOther}
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Additional Comments
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any other feedback or suggestions?
            </label>
            <textarea
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                errors.additionalComments ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              rows={4}
              maxLength={1000}
              placeholder="Share any additional thoughts, suggestions, or feedback..."
              value={formData.additionalComments}
              onChange={(e) => handleInputChange('additionalComments', e.target.value)}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.additionalComments ? (
                <p className="text-sm text-red-600">{errors.additionalComments}</p>
              ) : (
                <span></span>
              )}
              <span className="text-xs text-gray-500">
                {formData.additionalComments.length}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              'Submitting Feedback...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectFeedbackForm;