'use client';

/**
 * Admin Dashboard Page
 * Main entry point for admin functionality, composed of reusable components
 */

import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import StatsOverview from '@/components/admin/StatsOverview';
import RegistrationManagement from '@/components/admin/RegistrationManagement';
import DonationManagement from '@/components/admin/DonationManagement';
import { useAdminData } from '@/lib/hooks/useAdminData';
import { useRegistrationFilters } from '@/lib/hooks/useRegistrationFilters';
import { useDonationFilters } from '@/lib/hooks/useDonationFilters';

export default function AdminDashboard() {
  // Fetch admin data
  const { registrations, donations, loading, stats } = useAdminData();

  // Setup filters
  const {
    filteredRegistrations,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
  } = useRegistrationFilters(registrations);

  const {
    filteredDonations,
    statusFilter,
    setStatusFilter,
  } = useDonationFilters(donations);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading admin dashboard...</p>
      </div>
    );
  }

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
        <RegistrationManagement
          registrations={filteredRegistrations}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Donation Management */}
        <DonationManagement
          donations={filteredDonations}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </Container>

      <Footer />
    </div>
  );
}
