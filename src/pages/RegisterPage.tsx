import React from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import SignupForm from '../components/Auth/SignupForm';
import PageLoader from '../components/UI/PageLoader';

const RegisterPage: React.FC = () => {
  const { loading } = useAuthRedirect();

  if (loading) {
    return (
      <PageLoader 
        text="Loading..." 
        size="md"
        className="bg-gradient-to-br from-blue-50 to-purple-50"
      />
    );
  }

  return <SignupForm />;
};

export default RegisterPage;