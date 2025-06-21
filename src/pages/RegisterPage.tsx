import React from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import SignupForm from '../components/Auth/SignupForm';
import { Loader2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { loading } = useAuthRedirect();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <SignupForm />;
};

export default RegisterPage;