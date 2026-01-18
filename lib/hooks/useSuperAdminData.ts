/**
 * Custom hook for fetching and managing super admin dashboard data
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Registration, DonationStats } from '@/lib/types';

export function useSuperAdminData() {
  const router = useRouter();
  const supabase = createClient();

  const [allUsers, setAllUsers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DonationStats>({
    totalRegistrations: 0,
    totalDonations: 0,
    successfulDonations: 0,
    pendingDonations: 0,
    failedDonations: 0,
  });

  const fetchData = async () => {
    // Check authentication and superadmin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }

    // Fetch all users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, name, email, phone_number, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      setAllUsers(usersData || []);
    }

    // Fetch donation statistics
    const { data: donationsData, error: donError } = await supabase
      .from('donations')
      .select('amount, status');

    if (donError) {
      console.error('Error fetching donations:', donError);
    } else {
      const donations = donationsData || [];
      const successful = donations.filter((d) => d.status === 'success');
      const pending = donations.filter((d) => d.status === 'pending');
      const failed = donations.filter((d) => d.status === 'failed');
      const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);

      setStats({
        totalRegistrations: usersData?.length || 0,
        totalDonations: totalDonated,
        successfulDonations: successful.length,
        pendingDonations: pending.length,
        failedDonations: failed.length,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router, supabase]);

  return {
    allUsers,
    loading,
    stats,
    refetch: fetchData,
  };
}
