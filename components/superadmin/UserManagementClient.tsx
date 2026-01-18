'use client';

/**
 * Client-side User Management Component for Super Admin
 * Handles filtering and role management
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import RoleChangeModal from './RoleChangeModal';
import type { Registration, UserRole } from '@/lib/types';

type UserManagementClientProps = {
  users: Registration[];
};

type FilterState = {
  searchQuery: string;
  roleFilter: string;
  startDate: string;
  endDate: string;
};

export default function UserManagementClient({ users: initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    roleFilter: 'all',
    startDate: '',
    endDate: '',
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const handleRoleChangeClick = (user: Registration, targetRole: UserRole) => {
    setSelectedUser(user);
    setNewRole(targetRole);
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-user-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert(`Successfully changed ${selectedUser.name}'s role to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
      
      setIsModalOpen(false);
      setSelectedUser(null);
      setNewRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    if (role === 'admin') return 'bg-purple-500/10 text-purple-200';
    if (role === 'superadmin') return 'bg-rose-500/10 text-rose-200';
    return 'bg-blue-500/10 text-blue-200';
  };

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
    const matchesSearch =
      filters.searchQuery === '' ||
      user.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const userDate = new Date(user.created_at);
    const matchesStartDate = !filters.startDate || userDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || userDate <= new Date(filters.endDate);

    return matchesRole && matchesSearch && matchesStartDate && matchesEndDate;
  });

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
          <h3 className="text-lg font-semibold text-white">User Management</h3>
          <p className="text-sm text-slate-300">View all users and manage their roles.</p>
        </div>
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

      {/* Users List */}
      <div className="overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No users found.</p>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:grid-cols-[1.5fr_1.5fr_1fr_0.8fr_1fr_auto]"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
                  <p className="mt-1 text-sm font-semibold text-white">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-semibold text-white truncate">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-white">{user.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Registered</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === 'superadmin' ? (
                    <span className="text-xs text-slate-500">Protected</span>
                  ) : user.role === 'user' ? (
                    <Button
                      onClick={() => handleRoleChangeClick(user, 'admin')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Make Admin
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRoleChangeClick(user, 'user')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Remove Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {selectedUser && newRole && (
        <RoleChangeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
            setNewRole(null);
          }}
          onConfirm={handleConfirmRoleChange}
          userName={selectedUser.name}
          currentRole={selectedUser.role}
          newRole={newRole}
          isLoading={isUpdating}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Filter Users</h3>
            
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
