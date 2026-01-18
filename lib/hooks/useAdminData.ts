/**
 * Custom hook for fetching and managing admin dashboard data
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Registration, Donation, DonationStats } from '@/lib/types';

export function useAdminData() {
  const router = useRouter();
  const supabase = createClient();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DonationStats>({
    totalRegistrations: 0,
    totalDonations: 0,
    successfulDonations: 0,
    pendingDonations: 0,
    failedDonations: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      // Check authentication and admin role
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

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // Fetch all registrations
      const { data: regData, error: regError } = await supabase
        .from('profiles')
        .select('id, name, email, phone_number, role, created_at')
        .order('created_at', { ascending: false });

      if (regError) {
        console.error('Error fetching registrations:', regError);
        console.error('Error details:', JSON.stringify(regError));
        alert(`Failed to fetch registrations. Check console for details.`);
      } else {
        console.log('Fetched registrations:', regData?.length || 0);
        setRegistrations(regData || []);
      }

      // Fetch all donations with user details using foreign key join
      const { data: donData, error: donError } = await supabase
        .from('donations')
        .select(`
          id,
          user_id,
          amount,
          status,
          timestamp,
          transaction_id,
          profiles (
            name,
            email
          )
        `)
        .order('timestamp', { ascending: false });

      if (donError) {
        console.error('Error fetching donations:', donError);
        console.error('Donation error details:', JSON.stringify(donError));
      } else {
        console.log('Fetched donations:', donData?.length || 0);
        // Transform the joined data
        const donationsWithNames = (donData || []).map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          amount: d.amount,
          status: d.status,
          timestamp: d.timestamp,
          transaction_id: d.transaction_id,
          donor_name: d.profiles?.name || 'Unknown User',
          donor_email: d.profiles?.email || 'N/A',
        }));
        setDonations(donationsWithNames);

        // Calculate stats
        const successful = donationsWithNames.filter((d) => d.status === 'success');
        const pending = donationsWithNames.filter((d) => d.status === 'pending');
        const failed = donationsWithNames.filter((d) => d.status === 'failed');
        const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          totalRegistrations: regData?.length || 0,
          totalDonations: totalDonated,
          successfulDonations: successful.length,
          pendingDonations: pending.length,
          failedDonations: failed.length,
        });
      }

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router, supabase]);

  return {
    registrations,
    donations,
    loading,
    stats,
  };
}
