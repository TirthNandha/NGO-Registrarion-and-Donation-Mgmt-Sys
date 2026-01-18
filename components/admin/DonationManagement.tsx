/**
 * Donation management component for admin dashboard
 * Handles display, filtering, and export of donation records
 */

import { Button } from '@/components/ui/Button';
import type { Donation } from '@/lib/types';
import { exportToCSV, formatDateForCSV } from '@/lib/utils/csvExport';

type DonationManagementProps = {
  donations: Donation[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
};

export default function DonationManagement({
  donations,
  statusFilter,
  setStatusFilter,
}: DonationManagementProps) {
  const handleExport = () => {
    const headers = ['Donor Name', 'Email', 'Amount', 'Status', 'Transaction ID', 'Date'];
    const rows = donations.map((don) => [
      don.donor_name || 'N/A',
      don.donor_email || 'N/A',
      don.amount,
      don.status,
      don.transaction_id || 'N/A',
      formatDateForCSV(don.timestamp),
    ]);
    exportToCSV(headers, rows, 'donations');
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Donation Management</h3>
          <p className="text-sm text-slate-300">Track all donation records and payment status.</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          Export CSV
        </Button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="overflow-x-auto">
        {donations.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No donations found.</p>
        ) : (
          <div className="space-y-3">
            {donations.map((don) => (
              <div
                key={don.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:grid-cols-[1.5fr_1fr_1.5fr_1fr_auto]"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Donor</p>
                  <p className="mt-1 text-sm font-semibold text-white">{don.donor_name}</p>
                  <p className="text-xs text-slate-400 truncate">{don.donor_email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Amount</p>
                  <p className="mt-1 text-sm font-semibold text-white">₹{don.amount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Transaction ID</p>
                  <p className="mt-1 text-sm font-semibold text-white truncate">
                    {don.transaction_id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {new Date(don.timestamp).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    don.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : don.status === 'pending'
                      ? 'bg-amber-400/10 text-amber-200'
                      : 'bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {don.status.charAt(0).toUpperCase() + don.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
