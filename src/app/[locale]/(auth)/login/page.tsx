import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return (
    <AuthLayout 
      title={
        <React.Fragment>
          {dict.auth.login.title_1}<br />{dict.auth.login.title_2}
        </React.Fragment>
      }
    >
      <LoginForm dict={dict.auth.login} />
    </AuthLayout>
  );
}
