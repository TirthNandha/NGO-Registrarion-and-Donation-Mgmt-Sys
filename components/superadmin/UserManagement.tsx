'use client';

/**
 * User management component for super admin
 * Allows viewing all users and changing their roles
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import RoleChangeModal from './RoleChangeModal';
import type { Registration, UserRole } from '@/lib/types';

type UserManagementProps = {
  users: Registration[];
  onRoleChange: () => void;
};

export default function UserManagement({ users, onRoleChange }: UserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
      setIsModalOpen(false);
      setSelectedUser(null);
      setNewRole(null);
      onRoleChange(); // Refresh the data
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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch =
      searchQuery === '' ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">User Management</h3>
        <p className="text-sm text-slate-300">View all users and manage their roles.</p>
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
          <option value="superadmin">Super Admins</option>
        </select>
      </div>

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
    </section>
  );
}
