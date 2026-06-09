import React from 'react';
import { getDictionary, Locale } from '@/i18n/getDictionary';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/layout/AuthLayout';

export default async function RegisterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout
      title={
        <React.Fragment>
          {dict.auth.register.title_1}<br />{dict.auth.register.title_2}
        </React.Fragment>
      }
    >
      <RegisterForm dict={dict.auth.register} />
    </AuthLayout>
  );
}
