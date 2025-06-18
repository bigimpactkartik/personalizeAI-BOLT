import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, CheckCircle, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface PaymentStepProps {
  formData: ProjectFormData;
  onFinish: () => void;
  onPrevious: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  onFinish,
  onPrevious
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const features = [
    'AI-powered email personalization',
    'Advanced company targeting',
    'Email validation and verification',
    'Real-time campaign analytics',
    'Automated follow-up sequences',
    'GDPR compliant processing',
    'Priority customer support',
    'Campaign performance insights'
  ];

  const handlePaymentFailure = (error: any) => {
    setPaymentLoading(false);
    setPaymentError(error.description || 'Payment failed. Please try again.');
    // Scroll to top to show error message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    initializeRazorpay();
  };

  const handleGoBack = () => {
    setPaymentError(null);
    setPaymentLoading(false);
    setPaymentSuccess(false);
    onPrevious();
  };

  const initializeRazorpay = () => {
    setPaymentLoading(true);
    setPaymentError(null);

    const options = {
      key: 'rzp_test_1234567890', // Replace with your Razorpay key
      amount: price * 100, // Amount in paise
      currency: 'INR',
      name: 'PERSONALIZED-AI',
      description: `Payment for ${formData.projectName}`,
      image: '/logo.png', // Add your logo
      order_id: `order_${Date.now()}`, // Generate order ID from backend
      notes: {
        project_name: formData.projectName,
        ai_model: formData.aiModel.provider,
        mailboxes: formData.emailCapacity.mailboxes.toString(),
      },
      theme: {
        color: '#2563eb',
      },
      handler: function (response: any) {
        // Payment successful
        console.log('Payment successful:', response);
        setPaymentLoading(false);
        setPaymentSuccess(true);
        
        // Simulate API call to verify payment
        setTimeout(() => {
          onFinish();
        }, 2000);
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal
          setPaymentLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: any) {
      handlePaymentFailure(response.error);
    });

    rzp.open();
  };

  if (paymentSuccess) {
    return (
      <div className="fade-in-up">
        <Card className="p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Your payment has been processed successfully. Your project is being set up.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800">Amount Paid:</span>
              <span className="font-semibold text-green-900">₹{price}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-green-800">Project:</span>
              <span className="font-semibold text-green-900 truncate ml-2">{formData.projectName}</span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 mb-6">
            <p>You will receive a confirmation email shortly with your project details.</p>
          </div>

          <Button onClick={onFinish} size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        {/* Payment Error Alert */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg slide-in">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">Payment Failed</h4>
                <p className="text-sm text-red-700">{paymentError}</p>
                <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button 
                    onClick={handleRetryPayment} 
                    size="sm" 
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={handleGoBack} 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Review your project details and complete the payment to start processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Project Summary */}
          <div className="slide-in">
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
            </div>
          </div>

          {/* Pricing */}
          <div className="slide-in">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{price}</span>
                  <span className="text-xs sm:text-sm text-gray-500">one-time</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Complete project processing and results</p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Secure payment processing via Razorpay</span>
              </div>

              <Button
                onClick={initializeRazorpay}
                className="w-full transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                loading={paymentLoading}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Pay ₹{price} with Razorpay
                  </>
                )}
              </Button>
            </div>
          </div>
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
                <li>• Complete secure payment via Razorpay</li>
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
          <Button 
            onClick={initializeRazorpay} 
            size="lg" 
            className="w-full sm:w-auto transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            loading={paymentLoading}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentStep;