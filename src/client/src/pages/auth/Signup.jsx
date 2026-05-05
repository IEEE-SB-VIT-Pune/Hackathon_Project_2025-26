import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import OTPSignupForm from '../../components/auth/OTPSignupForm';

const Signup = () => {
  return (
    <AuthLayout>
      <OTPSignupForm />
    </AuthLayout>
  );
};

export default Signup;