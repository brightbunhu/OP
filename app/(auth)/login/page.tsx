import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthShell title="Login" subtitle="Access your OP Supermarket account and role-based workspace.">
      <LoginForm />
    </AuthShell>
  );
}
