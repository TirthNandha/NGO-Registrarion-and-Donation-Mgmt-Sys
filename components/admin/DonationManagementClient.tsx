'use client';

/**
 * Client wrapper for Donation Management with filtering
 */

import { useState, useMemo } from 'react';
import DonationManagement from './DonationManagement';
import type { Donation } from '@/lib/types';

type DonationManagementClientProps = {
  donations: Donation[];
};

export default function DonationManagementClient({
  donations,
}: DonationManagementClientProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDonations = useMemo(() => {
    return donations.filter((don) => {
      return statusFilter === 'all' || don.status === statusFilter;
    });
  }, [donations, statusFilter]);

  return (
    <DonationManagement
      donations={filteredDonations}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
    />
  );
}
