'use client';

/**
 * Client wrapper for Registration Management with filtering
 */

import { useState, useMemo } from 'react';
import RegistrationManagement from './RegistrationManagement';
import type { Registration } from '@/lib/types';

type RegistrationManagementClientProps = {
  registrations: Registration[];
};

export default function RegistrationManagementClient({
  registrations,
}: RegistrationManagementClientProps) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesRole = roleFilter === 'all' || reg.role === roleFilter;
      const matchesSearch =
        searchQuery === '' ||
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [registrations, roleFilter, searchQuery]);

  return (
    <RegistrationManagement
      registrations={filteredRegistrations}
      roleFilter={roleFilter}
      setRoleFilter={setRoleFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
