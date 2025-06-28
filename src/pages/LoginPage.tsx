import React from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import LoginForm from '../components/Auth/LoginForm';
import PageLoader from '../components/UI/PageLoader';

const LoginPage: React.FC = () => {
  const { loading } = useAuthRedirect();

  if (loading) {
    return (
      <PageLoader 
        text="Loading..." 
        size="md"
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50"
      />
    );
  }

  return <LoginForm />;
};

export default LoginPage;