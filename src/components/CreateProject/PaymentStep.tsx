import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface PaymentStepProps {
  formData: ProjectFormData;
  onFinish: () => void;
  onPrevious: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  onFinish,
  onPrevious
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const calculatePrice = () => {
    const basePrice = 299;
    const aiModelMultiplier = formData.aiModel.provider?.startsWith('openai') ? 1.5 : 1.0;
    const capacityMultiplier = Math.ceil(formData.emailCapacity.mailboxes / 5);
    
    return Math.round(basePrice * aiModelMultiplier * capacityMultiplier);
  };

  const price = calculatePrice();

  const handleGoBack = () => {
    onPrevious();
  };

  const handleProceedToPayment = () => {
    setPaymentLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      setPaymentLoading(false);
      onFinish();
    }, 1500);
  };

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Review your project details and complete the payment to start processing
          </p>
        </div>

        {/* Project Summary */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">Project Name:</span>
              <span className="font-medium text-sm sm:text-base truncate ml-2">{formData.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">AI Model:</span>
              <span className="font-medium text-sm sm:text-base capitalize">{formData.aiModel.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">Mailboxes:</span>
              <span className="font-medium text-sm sm:text-base">{formData.emailCapacity.mailboxes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">Emails per Mailbox:</span>
              <span className="font-medium text-sm sm:text-base">{formData.emailCapacity.emailsPerMailbox}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">Data Source:</span>
              <span className="font-medium text-sm sm:text-base capitalize">{formData.dataSource}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{price}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">One-time payment for complete project processing</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="mb-6">
          <Button
            onClick={handleProceedToPayment}
            className="w-full transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
            loading={paymentLoading}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              'Processing...'
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg fade-in-up">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">What happens next?</h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Complete secure payment</li>
                <li>• Your project will be queued for processing</li>
                <li>• AI will analyze your leads and generate personalized emails</li>
                <li>• Results will be available for download within 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
          <Button 
            variant="outline" 
            onClick={handleGoBack} 
            className="w-full sm:w-auto transition-all duration-200"
            disabled={paymentLoading}
          >
            Previous
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentStep;