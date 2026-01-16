'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

const donationRows = [
  {
    id: 'DON-1207',
    amount: '₹1,200',
    status: 'Success',
    date: '12 Jan 2026',
  },
  {
    id: 'DON-1198',
    amount: '₹500',
    status: 'Pending',
    date: '10 Jan 2026',
  },
  {
    id: 'DON-1183',
    amount: '₹750',
    status: 'Failed',
    date: '05 Jan 2026',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
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
      if (profile?.role !== 'user') {
        router.push('/auth');
        return;
      }

      // Set user data
      const createdAtDate = profile.created_at ? new Date(profile.created_at) : null;
      setUserData({
        name: profile.name || 'N/A',
        email: session.user.email || 'N/A',
        phoneNumber: profile.phone_number || '',
        createdAt: createdAtDate
          ? createdAtDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            })
          : 'N/A',
      });
    };
    checkSession();
  }, [router, supabase]);

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

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
                  ['Phone Number', userData.phoneNumber || 'Not provided'],
                  ['Registered on', userData.createdAt],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Donation Summary</h2>
            <p className="mt-2 text-sm text-slate-300">
              Track every attempt and status in one place.
            </p>
            <div className="mt-6 space-y-4">
              {[
                ['Total attempts', '12'],
                ['Successful donations', '8'],
                ['Pending', '2'],
                ['Failed', '2'],
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

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-lg font-semibold">Donation History</h2>
            <p className="text-sm text-slate-300">
              Latest donations with status tracking.
            </p>
          </div>
          <div className="mt-6 grid gap-3">
            {donationRows.map((row) => (
              <div
                key={row.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Donation ID
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{row.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Amount
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{row.amount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{row.date}</p>
                </div>
                <span
                  className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    row.status === 'Success'
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : row.status === 'Pending'
                      ? 'bg-amber-400/10 text-amber-200'
                      : 'bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}