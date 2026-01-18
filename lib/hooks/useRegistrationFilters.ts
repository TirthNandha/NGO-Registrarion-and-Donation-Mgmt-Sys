/**
 * Custom hook for filtering registrations with search and role filters
 */

import { useState, useMemo } from 'react';
import type { Registration } from '@/lib/types';

export function useRegistrationFilters(registrations: Registration[]) {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesRole = roleFilter === 'all' || reg.role === roleFilter;
      const matchesSearch =
        searchQuery === '' ||
        reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [registrations, roleFilter, searchQuery]);

  return {
    filteredRegistrations,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
  };
}
