'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button, ButtonLink } from '@/components/ui/Button';

type Registration = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
};

type Donation = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  timestamp: string;
  transaction_id: string;
  donor_name?: string;
  donor_email?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalDonations: 0,
    successfulDonations: 0,
    pendingDonations: 0,
    failedDonations: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // Fetch all registrations
      const { data: regData, error: regError } = await supabase
        .from('profiles')
        .select('id, name, email, phone_number, role, created_at')
        .order('created_at', { ascending: false });

      if (regError) {
        console.error('Error fetching registrations:', regError);
        console.error('Error details:', JSON.stringify(regError));
        alert(`Failed to fetch registrations. Check console for details.`);
      } else {
        console.log('Fetched registrations:', regData?.length || 0);
        setRegistrations(regData || []);
      }

      // Fetch all donations with user details using foreign key join
      const { data: donData, error: donError } = await supabase
        .from('donations')
        .select(`
          id,
          user_id,
          amount,
          status,
          timestamp,
          transaction_id,
          profiles (
            name,
            email
          )
        `)
        .order('timestamp', { ascending: false });

      if (donError) {
        console.error('Error fetching donations:', donError);
        console.error('Donation error details:', JSON.stringify(donError));
      } else {
        console.log('Fetched donations:', donData?.length || 0);
        // Transform the joined data
        const donationsWithNames = (donData || []).map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          amount: d.amount,
          status: d.status,
          timestamp: d.timestamp,
          transaction_id: d.transaction_id,
          donor_name: d.profiles?.name || 'Unknown User',
          donor_email: d.profiles?.email || 'N/A',
        }));
        setDonations(donationsWithNames);

        // Calculate stats
        const successful = donationsWithNames.filter((d) => d.status === 'success');
        const pending = donationsWithNames.filter((d) => d.status === 'pending');
        const failed = donationsWithNames.filter((d) => d.status === 'failed');
        const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          totalRegistrations: regData?.length || 0,
          totalDonations: totalDonated,
          successfulDonations: successful.length,
          pendingDonations: pending.length,
          failedDonations: failed.length,
        });
      }

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router, supabase]);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesRole = roleFilter === 'all' || reg.role === roleFilter;
    const matchesSearch =
      searchQuery === '' ||
      reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filter donations
  const filteredDonations = donations.filter((don) => {
    return statusFilter === 'all' || don.status === statusFilter;
  });

  // Export registrations to CSV
  const exportRegistrations = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Registered On'];
    const rows = filteredRegistrations.map((reg) => [
      reg.name || 'N/A',
      reg.email || 'N/A',
      reg.phone_number || 'N/A',
      reg.role,
      new Date(reg.created_at).toLocaleDateString('en-GB'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export donations to CSV
  const exportDonations = () => {
    const headers = ['Donor Name', 'Email', 'Amount', 'Status', 'Transaction ID', 'Date'];
    const rows = filteredDonations.map((don) => [
      don.donor_name || 'N/A',
      don.donor_email || 'N/A',
      don.amount,
      don.status,
      don.transaction_id || 'N/A',
      new Date(don.timestamp).toLocaleDateString('en-GB'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader
        actions={
          <>
            <ButtonLink href="/" variant="ghost" size="sm" className="text-white/70 hover:text-white">
              Home
            </ButtonLink>
            <LogoutButton />
          </>
        }
      />

      <Container className="space-y-10 py-10">
        {/* Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
            <p className="text-sm text-slate-400">
              Manage registrations and monitor donations.
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Total Registrations</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.totalRegistrations}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Total Donations</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">₹{stats.totalDonations.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Successful</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.successfulDonations}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Pending / Failed</p>
            <p className="mt-2 text-3xl font-semibold text-amber-400">
              {stats.pendingDonations} / {stats.failedDonations}
            </p>
          </div>
        </section>

        {/* Registration Management */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Registration Management</h3>
              <p className="text-sm text-slate-300">View and manage all registered users.</p>
            </div>
            <Button onClick={exportRegistrations} variant="outline" size="sm">
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

        {/* Donation Management */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Donation Management</h3>
              <p className="text-sm text-slate-300">Track all donation records and payment status.</p>
            </div>
            <Button onClick={exportDonations} variant="outline" size="sm">
              Export CSV
            </Button>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

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
        </section>
      </Container>

      <Footer />
    </div>
  );
}
