'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      // Fetch role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        router.push('/auth');  // Redirect if not admin
      }
    };
    checkSession();
  }, [router]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <LogoutButton />
    </div>
  );
}