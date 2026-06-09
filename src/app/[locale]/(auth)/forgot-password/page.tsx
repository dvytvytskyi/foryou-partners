import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout 
      title={<React.Fragment>{dict.auth.forgot_password.title_1} <br/> {dict.auth.forgot_password.title_2}</React.Fragment>}
      subtitle={dict.auth.forgot_password.subtitle}
    >
      <ForgotPasswordForm dict={dict.auth.forgot_password} />
    </AuthLayout>
  );
}
