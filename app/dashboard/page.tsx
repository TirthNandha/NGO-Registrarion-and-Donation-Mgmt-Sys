import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import DonationSummaryCard from '@/components/dashboard/DonationSummaryCard';
import DonationHistoryTable from '@/components/dashboard/DonationHistoryTable';
import PaymentNotification from '@/components/dashboard/PaymentNotification';
import type { UserProfile } from '@/lib/types';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, phone_number, created_at')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'user') {
    redirect('/auth');
  }

  // Fetch user data
  const createdAtDate = profile.created_at ? new Date(profile.created_at) : null;
  const userData: UserProfile = {
    name: profile.name || 'N/A',
    email: user.email || 'N/A',
    phoneNumber: profile.phone_number || 'Not provided',
    createdAt: createdAtDate
      ? createdAtDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A',
  };

  // Fetch donations
  const { data: donations } = await supabase
    .from('donations')
    .select('id, amount, status, timestamp, transaction_id')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });

  const donationsList = donations || [];

  // Calculate donation statistics
  const totalAttempts = donationsList.length;
  const successful = donationsList.filter(d => d.status === 'success').length;
  const pending = donationsList.filter(d => d.status === 'pending').length;
  const failed = donationsList.filter(d => d.status === 'failed').length;

  const donationStats = { totalAttempts, successful, pending, failed };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Payment notification handler */}
      <PaymentNotification />
      
      <AppHeader
        actions={
          <>
            <ButtonLink
              href="/"
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
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
            <h2 className="text-2xl font-semibold text-white">User Dashboard</h2>
            <p className="text-sm text-slate-400">
              View your registration details and donation history.
            </p>
          </div>
          <ButtonLink href="/donate" variant="outline" size="sm">
            Make a donation
          </ButtonLink>
        </section>

        {/* Profile and Summary Cards */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <UserProfileCard userData={userData} />
          <DonationSummaryCard {...donationStats} />
        </section>

        {/* Donation History */}
        <DonationHistoryTable donations={donationsList} />
      </Container>

      <Footer />
    </div>
  );
}
