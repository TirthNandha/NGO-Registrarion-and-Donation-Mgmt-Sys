/**
 * Registration management component for admin dashboard
 * Handles display, filtering, and export of user registrations
 */

import { Button } from '@/components/ui/Button';
import type { Registration } from '@/lib/types';
import { exportToCSV, formatDateForCSV } from '@/lib/utils/csvExport';

type RegistrationManagementProps = {
  registrations: Registration[];
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function RegistrationManagement({
  registrations,
  roleFilter,
  setRoleFilter,
  searchQuery,
  setSearchQuery,
}: RegistrationManagementProps) {
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Registered On'];
    const rows = registrations.map((reg) => [
      reg.name || 'N/A',
      reg.email || 'N/A',
      reg.phone_number || 'N/A',
      reg.role,
      formatDateForCSV(reg.created_at),
    ]);
    exportToCSV(headers, rows, 'registrations');
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Registration Management</h3>
          <p className="text-sm text-slate-300">View and manage all registered users.</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Registrations Table */}
      <div className="overflow-x-auto">
        {registrations.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No registrations found.</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
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
    </section>
  );
}
