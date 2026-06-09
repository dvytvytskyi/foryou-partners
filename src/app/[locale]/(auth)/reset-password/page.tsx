import React, { Suspense } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout 
      title={<React.Fragment>{dict.auth.reset_password.title_1} <br/> {dict.auth.reset_password.title_2}</React.Fragment>}
      subtitle={dict.auth.reset_password.subtitle}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm dict={dict.auth.reset_password} />
      </Suspense>
    </AuthLayout>
  );
}
