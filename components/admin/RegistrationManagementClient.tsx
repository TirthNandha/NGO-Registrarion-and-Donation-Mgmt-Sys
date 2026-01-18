'use client';

/**
 * Client-side Registration Management Component
 * Handles filtering and CSV export of user registrations
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Registration } from '@/lib/types';
import { exportToCSV, formatDateForCSV } from '@/lib/utils/csvExport';

type RegistrationManagementClientProps = {
  registrations: Registration[];
};

type FilterState = {
  searchQuery: string;
  roleFilter: string;
  startDate: string;
  endDate: string;
};

export default function RegistrationManagementClient({ registrations }: RegistrationManagementClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    roleFilter: 'all',
    startDate: '',
    endDate: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Apply filters to registrations
  const filteredRegistrations = registrations.filter((reg) => {
    // Search filter
    const matchesSearch =
      filters.searchQuery === '' ||
      reg.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      reg.email?.toLowerCase().includes(filters.searchQuery.toLowerCase());

    // Role filter
    const matchesRole = filters.roleFilter === 'all' || reg.role === filters.roleFilter;

    // Date filter
    const regDate = new Date(reg.created_at);
    const matchesStartDate = !filters.startDate || regDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || regDate <= new Date(filters.endDate);

    return matchesSearch && matchesRole && matchesStartDate && matchesEndDate;
  });

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Registered On'];
    const rows = filteredRegistrations.map((reg) => [
      reg.name || 'N/A',
      reg.email || 'N/A',
      reg.phone_number || 'N/A',
      reg.role,
      formatDateForCSV(reg.created_at),
    ]);
    exportToCSV(headers, rows, 'registrations');
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      searchQuery: '',
      roleFilter: 'all',
      startDate: '',
      endDate: '',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilterModal(false);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Registration Management</h3>
          <p className="text-sm text-slate-300">View and manage all registered users.</p>
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

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
        />
      </div>

      {/* Active Filters Display */}
      {(filters.roleFilter !== 'all' || filters.startDate || filters.endDate) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.roleFilter !== 'all' && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
              Role: {filters.roleFilter}
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
        </div>
      )}

      {/* Registrations Table */}
      <div className="overflow-x-auto">
        {filteredRegistrations.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No registrations found.</p>
        ) : (
          <div className="space-y-3">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:grid-cols-[1.5fr_1.5fr_1fr_0.8fr_1fr]"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
                  <p className="mt-1 text-sm font-semibold text-white">{reg.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-semibold text-white truncate">{reg.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-white">{reg.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      reg.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-200'
                        : reg.role === 'superadmin'
                        ? 'bg-rose-500/10 text-rose-200'
                        : 'bg-blue-500/10 text-blue-200'
                    }`}
                  >
                    {reg.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Registered</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {new Date(reg.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Filter Registrations</h3>
            
            <div className="space-y-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Role</label>
                <select
                  value={tempFilters.roleFilter}
                  onChange={(e) => setTempFilters({ ...tempFilters, roleFilter: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                  <option value="superadmin">Super Admins</option>
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
