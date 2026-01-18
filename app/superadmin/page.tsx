'use client';

/**
 * Super Admin Dashboard Page
 * Allows super admin to view stats and manage user roles
 */

import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import StatsOverview from '@/components/admin/StatsOverview';
import UserManagement from '@/components/superadmin/UserManagement';
import { useSuperAdminData } from '@/lib/hooks/useSuperAdminData';

export default function SuperAdminDashboard() {
  const { allUsers, loading, stats, refetch } = useSuperAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading super admin dashboard...</p>
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
        <UserManagement users={allUsers} onRoleChange={refetch} />
      </Container>

      <Footer />
    </div>
  );
}
