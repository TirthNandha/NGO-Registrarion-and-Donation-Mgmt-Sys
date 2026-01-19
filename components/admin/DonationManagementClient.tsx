'use client';


import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Donation } from '@/lib/types';
import { exportToCSV, formatDateForCSV } from '@/lib/utils/csvExport';

type DonationManagementClientProps = {
  donations: Donation[];
};

type FilterState = {
  statusFilter: string;
  startDate: string;
  endDate: string;
  amountOperator: 'all' | 'less' | 'more';
  amountValue: string;
};

export default function DonationManagementClient({ donations }: DonationManagementClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    statusFilter: 'all',
    startDate: '',
    endDate: '',
    amountOperator: 'all',
    amountValue: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Apply filters to donations
  const filteredDonations = donations.filter((don) => {
    // Status filter
    const matchesStatus = filters.statusFilter === 'all' || don.status === filters.statusFilter;

    // Date filter
    const donDate = new Date(don.timestamp);
    const matchesStartDate = !filters.startDate || donDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || donDate <= new Date(filters.endDate);

    // Amount filter
    let matchesAmount = true;
    if (filters.amountOperator !== 'all' && filters.amountValue) {
      const filterAmount = parseFloat(filters.amountValue);
      if (filters.amountOperator === 'less') {
        matchesAmount = don.amount < filterAmount;
      } else if (filters.amountOperator === 'more') {
        matchesAmount = don.amount > filterAmount;
      }
    }

    return matchesStatus && matchesStartDate && matchesEndDate && matchesAmount;
  });

  const handleExport = () => {
    const headers = ['Donor Name', 'Email', 'Amount', 'Status', 'Transaction ID', 'Date'];
    const rows = filteredDonations.map((don) => [
      don.donor_name || 'N/A',
      don.donor_email || 'N/A',
      don.amount,
      don.status,
      don.transaction_id || 'N/A',
      formatDateForCSV(don.timestamp),
    ]);
    exportToCSV(headers, rows, 'donations');
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      statusFilter: 'all',
      startDate: '',
      endDate: '',
      amountOperator: 'all' as const,
      amountValue: '',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilterModal(false);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Donation Management</h3>
          <p className="text-sm text-slate-300">Track all donation records and payment status.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilterModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.statusFilter !== 'all' || filters.startDate || filters.endDate || filters.amountOperator !== 'all') && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.statusFilter !== 'all' && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
              Status: {filters.statusFilter}
            </span>
          )}
          {filters.startDate && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
              From: {new Date(filters.startDate).toLocaleDateString()}
            </span>
          )}
          {filters.endDate && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
              To: {new Date(filters.endDate).toLocaleDateString()}
            </span>
          )}
          {filters.amountOperator !== 'all' && filters.amountValue && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
              Amount {filters.amountOperator === 'less' ? '<' : '>'} ₹{filters.amountValue}
            </span>
          )}
        </div>
      )}

      {/* Donations Table */}
      <div className="overflow-x-auto">
        {filteredDonations.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No donations found.</p>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map((don) => (
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Filter Donations</h3>
            
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Status</label>
                <select
                  value={tempFilters.statusFilter}
                  onChange={(e) => setTempFilters({ ...tempFilters, statusFilter: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={tempFilters.startDate}
                  onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
                />
              </div>

              {/* Amount Filter */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Amount Filter</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={tempFilters.amountOperator}
                    onChange={(e) => setTempFilters({ ...tempFilters, amountOperator: e.target.value as any })}
                    className="h-10 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="less">Less than</option>
                    <option value="more">More than</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={tempFilters.amountValue}
                    onChange={(e) => setTempFilters({ ...tempFilters, amountValue: e.target.value })}
                    disabled={tempFilters.amountOperator === 'all'}
                    className="h-10 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={() => setShowFilterModal(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilters}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
