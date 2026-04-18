import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Відновлення пароля" 
      subtitle="Введіть ваш email, і ми надішлемо інструкції"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
