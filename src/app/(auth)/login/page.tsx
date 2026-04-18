import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="" 
      subtitle="Enter your credentials to access your leads"
    >
      <LoginForm />
    </AuthLayout>
  );
}
