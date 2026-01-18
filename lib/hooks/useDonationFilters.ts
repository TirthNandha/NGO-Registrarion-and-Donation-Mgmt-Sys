/**
 * Custom hook for filtering donations by status
 */

import { useState, useMemo } from 'react';
import type { Donation } from '@/lib/types';

export function useDonationFilters(donations: Donation[]) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDonations = useMemo(() => {
    return donations.filter((don) => {
      return statusFilter === 'all' || don.status === statusFilter;
    });
  }, [donations, statusFilter]);

  return {
    filteredDonations,
    statusFilter,
    setStatusFilter,
  };
}
