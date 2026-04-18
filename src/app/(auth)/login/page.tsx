import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Авторизація" 
      subtitle="Увійдіть, щоб отримати доступ до ваших лідів"
    >
      <LoginForm />
    </AuthLayout>
  );
}
