'use client';

/**
 * User Dashboard Page
 * Displays user profile, donation summary, and donation history
 */

import { useMemo } from 'react';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import DonationSummaryCard from '@/components/dashboard/DonationSummaryCard';
import DonationHistoryTable from '@/components/dashboard/DonationHistoryTable';
import { useUserDashboard } from '@/lib/hooks/useUserDashboard';

export default function Dashboard() {
  const { userData, donations, loading } = useUserDashboard();

  // Calculate donation statistics
  const donationStats = useMemo(() => {
    const totalAttempts = donations.length;
    const successful = donations.filter(d => d.status === 'success').length;
    const pending = donations.filter(d => d.status === 'pending').length;
    const failed = donations.filter(d => d.status === 'failed').length;

    return { totalAttempts, successful, pending, failed };
  }, [donations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
          {userData && <UserProfileCard userData={userData} />}
          <DonationSummaryCard {...donationStats} />
        </section>

        {/* Donation History */}
        <DonationHistoryTable donations={donations} />
      </Container>

      <Footer />
    </div>
  );
}
