import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { PlatformFeedbackFormData, FeedbackCategory, FEEDBACK_CATEGORIES } from '../../types/feedback';
import Button from '../UI/Button';
import StarRating from '../UI/StarRating';
import Select from '../UI/Select';

interface PlatformFeedbackFormProps {
  onSubmit: (feedback: PlatformFeedbackFormData) => Promise<void>;
  onCancel?: () => void;
}

const PlatformFeedbackForm: React.FC<PlatformFeedbackFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<PlatformFeedbackFormData>({
    overallRating: 0,
    category: 'general',
    comments: '',
    contactForFollowUp: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.overallRating === 0) {
      newErrors.overallRating = 'Overall rating is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a feedback category';
    }

    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    } else if (formData.comments.length > 1000) {
      newErrors.comments = 'Comments must be 1000 characters or less';
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

  const handleInputChange = (field: keyof PlatformFeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
        <p className="text-gray-600 mb-6">
          Your feedback has been submitted successfully. We appreciate your input and will use it to improve our platform.
        </p>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Share Your Experience</h3>
        </div>
        <p className="text-sm text-gray-600">
          Help us improve PERSONALIZED-AI by sharing your thoughts and suggestions
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <StarRating
          label="How would you rate your overall experience?"
          rating={formData.overallRating}
          onRatingChange={(rating) => handleInputChange('overallRating', rating)}
          error={errors.overallRating}
          required
        />

        {/* Category Selection */}
        <Select
          label="What category best describes your feedback?"
          options={FEEDBACK_CATEGORIES.map(cat => ({
            value: cat.value,
            label: cat.label,
            description: cat.description
          }))}
          value={formData.category}
          onChange={(value) => handleInputChange('category', value as FeedbackCategory)}
          placeholder="Select a category"
          error={errors.category}
          required
        />

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your feedback and suggestions <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              errors.comments ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            rows={6}
            maxLength={1000}
            placeholder="Tell us about your experience, what you like, what could be improved, or any suggestions you have..."
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comments ? (
              <p className="text-sm text-red-600">{errors.comments}</p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-500">
              {formData.comments.length}/1000
            </span>
          </div>
        </div>

        {/* Contact for Follow-up */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="contactForFollowUp"
            checked={formData.contactForFollowUp}
            onChange={(e) => handleInputChange('contactForFollowUp', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="contactForFollowUp" className="text-sm text-gray-700 leading-relaxed">
            I'm open to being contacted for follow-up questions about my feedback
          </label>
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
    </div>
  );
};

export default PlatformFeedbackForm;