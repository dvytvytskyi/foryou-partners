import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email and we'll send you instructions"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
