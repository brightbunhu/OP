import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className="gap-2">
        <LogOut aria-hidden="true" size={16} />
        Logout
      </Button>
    </form>
  );
}
