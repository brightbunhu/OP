import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Register as a customer and access the storefront instantly.">
      <RegisterForm />
    </AuthShell>
  );
}
