import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import StatsOverview from '@/components/admin/StatsOverview';
import UserManagementClient from '@/components/superadmin/UserManagementClient';
import type { DonationStats } from '@/lib/types';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const supabase = await createClient();

  // Check authentication and superadmin role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Fetch all users
  const { data: usersData } = await supabase
    .from('profiles')
    .select('id, name, email, phone_number, role, created_at')
    .order('created_at', { ascending: false });

  // Fetch donation statistics
  const { data: donationsData } = await supabase
    .from('donations')
    .select('amount, status');

  const allUsers = usersData || [];
  const donations = donationsData || [];
  
  const successful = donations.filter((d) => d.status === 'success');
  const pending = donations.filter((d) => d.status === 'pending');
  const failed = donations.filter((d) => d.status === 'failed');
  const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);

  const stats: DonationStats = {
    totalRegistrations: allUsers.length,
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
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">Super Admin Dashboard</h2>
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
                SUPERADMIN
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Manage user roles and view system-wide statistics.
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* User Management */}
        <UserManagementClient users={allUsers} />
      </Container>

      <Footer />
    </div>
  );
}
