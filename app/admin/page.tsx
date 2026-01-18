import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import StatsOverview from '@/components/admin/StatsOverview';
import RegistrationManagementClient from '@/components/admin/RegistrationManagementClient';
import DonationManagementClient from '@/components/admin/DonationManagementClient';
import type { DonationStats } from '@/lib/types';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all registrations
  const { data: registrations } = await supabase
    .from('profiles')
    .select('id, name, email, phone_number, role, created_at')
    .order('created_at', { ascending: false });

  // Fetch all donations with user profile data
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select(`
      id,
      user_id,
      amount,
      status,
      timestamp,
      transaction_id,
      profiles!user_id (
        name,
        email
      )
    `)
    .order('timestamp', { ascending: false });

  // Log any errors for debugging
  if (donationsError) {
    console.error('Error fetching donations:', donationsError);
  }

  const registrationsList = registrations || [];
  
  // Transform donations to include donor info
  const donationsList = (donations || []).map((donation: any) => ({
    id: donation.id,
    user_id: donation.user_id,
    amount: donation.amount,
    status: donation.status,
    timestamp: donation.timestamp,
    transaction_id: donation.transaction_id,
    donor_name: donation.profiles?.name || 'N/A',
    donor_email: donation.profiles?.email || 'N/A',
  }));

  // Calculate stats
  const successful = donationsList.filter((d) => d.status === 'success');
  const pending = donationsList.filter((d) => d.status === 'pending');
  const failed = donationsList.filter((d) => d.status === 'failed');
  const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);

  const stats: DonationStats = {
    totalRegistrations: registrationsList.length,
    totalDonations: totalDonated,
    successfulDonations: successful.length,
    pendingDonations: pending.length,
    failedDonations: failed.length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader
        actions={
          <>
            <ButtonLink href="/" variant="ghost" size="sm" className="text-white/70 hover:text-white">
              Home
            </ButtonLink>
            <LogoutButton />
          </>
        }
      />

      <Container className="space-y-10 py-10">
        {/* Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
            <p className="text-sm text-slate-400">
              Manage registrations and monitor donations.
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Registration Management */}
        <RegistrationManagementClient registrations={registrationsList} />

        {/* Donation Management */}
        <DonationManagementClient donations={donationsList} />
      </Container>

      <Footer />
    </div>
  );
}
