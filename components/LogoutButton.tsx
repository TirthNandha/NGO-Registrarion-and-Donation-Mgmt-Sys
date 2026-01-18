'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function LogoutButton() {
    const router = useRouter();
  
    const handleLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth');
      router.refresh();
    }

    return (
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:border-white"
        >
          Logout
        </Button>
    );
}