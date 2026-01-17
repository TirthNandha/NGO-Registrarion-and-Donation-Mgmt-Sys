'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
  } | null>(null);

  const [donations, setDonations] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAttempts: 0,
    successful: 0,
    pending: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // 1. Session & Role Check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, phone_number, created_at')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'user') {
        router.push('/auth');
        return;
      }

      // 2. Set user profile data
      const createdAtDate = profile.created_at ? new Date(profile.created_at) : null;
      setUserData({
        name: profile.name || 'N/A',
        email: session.user.email || 'N/A',
        phoneNumber: profile.phone_number || 'Not provided',
        createdAt: createdAtDate
          ? createdAtDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A',
      });

      // 3. Fetch real donations
      const { data: donationData, error } = await supabase
        .from('donations')
        .select('id, amount, status, timestamp, transaction_id')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching donations:', error);
      }

      const realDonations = donationData || [];
      setDonations(realDonations);

      // 4. Calculate summary
      const successful = realDonations.filter(d => d.status === 'success').length;
      const pending = realDonations.filter(d => d.status === 'pending').length;
      const failed = realDonations.filter(d => d.status === 'failed').length;

      setSummary({
        totalAttempts: realDonations.length,
        successful,
        pending,
        failed,
      });

      setLoading(false);

      // 5. Handle PayU callback (success/failed)
      const payment = searchParams.get('payment');
      const donationId = searchParams.get('donationId');
      const txnid = searchParams.get('txnid');

      if (payment && donationId) {
        const newStatus = payment === 'success' ? 'success' : 'failed';

        await supabase
          .from('donations')
          .update({
            status: newStatus,
            transaction_id: txnid || null,
          })
          .eq('id', donationId);

        // Clean URL after handling
        router.replace('/dashboard', { scroll: false });
      }
    };

    initialize();
  }, [router, supabase, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader
        actions={
          <>
            <ButtonLink
              href="/"
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
              Home
            </ButtonLink>
            <LogoutButton />
          </>
        }
      />

      <Container className="space-y-10 py-10">
        {/* Header Section */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">User Dashboard</h2>
            <p className="text-sm text-slate-400">
              View your registration details and donation history.
            </p>
          </div>
          <ButtonLink href="/donate" variant="outline" size="sm">
            Make a donation
          </ButtonLink>
        </section>

        {/* Registration Details + Summary */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Registration Details */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Registration Details</h2>
            <p className="mt-2 text-sm text-slate-300">
              Your profile is saved even if a donation does not complete.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {userData &&
                [
                  ['Full name', userData.name],
                  ['Email', userData.email],
                  ['Phone Number', userData.phoneNumber],
                  ['Registered on', userData.createdAt],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Donation Summary - Now Dynamic */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Donation Summary</h2>
            <p className="mt-2 text-sm text-slate-300">
              Track every attempt and status in one place.
            </p>
            <div className="mt-6 space-y-4">
              {[
                ['Total attempts', summary.totalAttempts],
                ['Successful donations', summary.successful],
                ['Pending', summary.pending],
                ['Failed', summary.failed],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Donation History - Now Real Data */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-lg font-semibold">Donation History</h2>
            <p className="text-sm text-slate-300">
              Latest donations with status tracking.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {donations.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                No donations yet. Start supporting the cause today!
              </p>
            ) : (
              donations.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Donation ID</p>
                    <p className="mt-1 text-sm font-semibold text-white">{row.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Amount</p>
                    <p className="mt-1 text-sm font-semibold text-white">₹{row.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {new Date(row.timestamp).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-200'
                        : row.status === 'pending'
                        ? 'bg-amber-400/10 text-amber-200'
                        : 'bg-rose-500/10 text-rose-200'
                    }`}
                  >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </Container>
    </div>
  );
}