import { Suspense } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthLayout 
      title="Новий пароль" 
      subtitle="Встановіть новий міцний пароль для вашого акаунту"
    >
      <Suspense fallback={<div className="badge">Завантаження...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
