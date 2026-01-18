/**
 * Statistics overview component for admin dashboard
 * Displays key metrics: registrations, donations, and status counts
 */

import type { DonationStats } from '@/lib/types';

type StatsOverviewProps = {
  stats: DonationStats;
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">Total Registrations</p>
        <p className="mt-2 text-3xl font-semibold text-white">{stats.totalRegistrations}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">Total Donations</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-400">
          ₹{stats.totalDonations.toLocaleString()}
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">Successful</p>
        <p className="mt-2 text-3xl font-semibold text-white">{stats.successfulDonations}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">Pending / Failed</p>
        <p className="mt-2 text-3xl font-semibold text-amber-400">
          {stats.pendingDonations} / {stats.failedDonations}
        </p>
      </div>
    </section>
  );
}
