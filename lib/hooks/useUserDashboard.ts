/**
 * Custom hook for fetching user dashboard data
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';

type Donation = {
  id: string;
  amount: number;
  status: string;
  timestamp: string;
  transaction_id: string;
};

export function useUserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, phone_number, created_at')
        .eq('id', session.user.id)
        .single();
      if (profile?.role !== 'user') {
        router.push('/auth');
        return;
      }

      // Set user data
      const createdAtDate = profile.created_at ? new Date(profile.created_at) : null;
      setUserData({
        name: profile.name || 'N/A',
        email: session.user.email || 'N/A',
        phoneNumber: profile.phone_number || 'Not provided',
        createdAt: createdAtDate
          ? createdAtDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
      });
    };
    checkSession();

    const fetchDonations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('donations')
        .select('id, amount, status, timestamp, transaction_id')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });

      setDonations(data || []);
      setLoading(false);
    };
    fetchDonations();

    // Success/Failed message from query param
    const payment = searchParams.get('payment');
    if (payment) {
      alert(`Payment ${payment.toUpperCase()}! Your donation status has been updated.`);
      router.replace('/dashboard'); // Clean URL
    }
  }, [router, supabase, searchParams]);

  return {
    userData,
    donations,
    loading,
  };
}
