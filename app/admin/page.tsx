'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import AppHeader from '@/components/layout/AppHeader';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

const registrationRows = [
  {
    name: 'Ananya Sharma',
    email: 'ananya@email.com',
    role: 'User',
    joined: '12 Jan 2026',
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@email.com',
    role: 'User',
    joined: '10 Jan 2026',
  },
  {
    name: 'Admin Ops',
    email: 'admin@email.com',
    role: 'Admin',
    joined: '05 Jan 2026',
  },
];

const donationRows = [
  {
    donor: 'Ananya Sharma',
    amount: '₹1,200',
    status: 'Success',
    date: '12 Jan 2026',
  },
  {
    donor: 'Rahul Verma',
    amount: '₹500',
    status: 'Pending',
    date: '10 Jan 2026',
  },
  {
    donor: 'Neha Gupta',
    amount: '₹750',
    status: 'Failed',
    date: '05 Jan 2026',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
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
        router.push('/auth');
      }
    };
    checkSession();
  }, [router]);

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
            <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
            <p className="text-sm text-slate-400">
              Monitor registrations, donation status, and reports.
            </p>
          </div>
          <ButtonLink href="#" variant="outline" size="sm">
            Export data
          </ButtonLink>
        </section>

        <section className="grid gap-6 lg:grid-cols-4">
          {[
            ['Total registrations', '1,248'],
            ['Total donations', '₹4,85,000'],
            ['Successful payments', '842'],
            ['Pending / Failed', '63 / 22'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Registrations</h2>
                <p className="text-sm text-slate-300">
                  Filter, review, and export supporter registrations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="#" variant="outline" size="sm">
                  Filter by role
                </ButtonLink>
                <ButtonLink href="#" variant="outline" size="sm">
                  Filter by date
                </ButtonLink>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {registrationRows.map((row) => (
                <div
                  key={row.email}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:grid-cols-[1.1fr_1.3fr_0.6fr_0.7fr]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Name
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {row.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {row.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {row.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Joined
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {row.joined}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Donation Insights</h2>
              <p className="mt-2 text-sm text-slate-300">
                Aggregated donation amounts and payment status updates.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  ['Today', '₹32,500'],
                  ['This week', '₹2,10,000'],
                  ['This month', '₹4,85,000'],
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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Payment status log</h2>
              <p className="mt-2 text-sm text-slate-300">
                Latest donation attempts with timestamps.
              </p>
              <div className="mt-6 grid gap-3">
                {donationRows.map((row) => (
                  <div
                    key={row.donor + row.date}
                    className="grid gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{row.donor}</span>
                      <span className="text-slate-400">{row.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{row.amount}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}