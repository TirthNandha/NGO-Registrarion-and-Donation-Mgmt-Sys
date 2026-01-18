/**
 * Shared type definitions used across the application
 */

export type UserRole = 'user' | 'admin' | 'superadmin';

export type Registration = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
};

export type Donation = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  timestamp: string;
  transaction_id: string;
  donor_name?: string;
  donor_email?: string;
};

export type DonationStats = {
  totalRegistrations: number;
  totalDonations: number;
  successfulDonations: number;
  pendingDonations: number;
  failedDonations: number;
};

export type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
};
