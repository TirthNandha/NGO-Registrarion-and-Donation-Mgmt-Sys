import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeatureCard from '@/components/home/FeatureCard';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: 'admin' | 'user' | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role ?? null;
  }

  const cta = user
    ? {
        href: role === 'admin' ? '/admin' : '/dashboard',
        label: role === 'admin' ? 'Go to Admin' : 'Go to Dashboard',
      }
    : { href: '/auth', label: 'Login' };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cta={cta} />

      <main>
        <section className="relative overflow-hidden pb-20 pt-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
          <div className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[120px]" />
          <Container className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Badge>Sahaay • Registration-first, donation-ready</Badge>
              <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                Sahaay connects hearts and secures futures for every campaign.
              </h1>
              <p className="text-lg text-slate-300">
                Connecting Hearts, Securing Futures.
              </p>
              <p className="text-base text-slate-300">
                Separate registration from payment flow so every supporter is
                captured, every donation attempt is tracked, and every report is
                accurate.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={cta.href} size="lg">
                  {cta.label}
                </ButtonLink>
                <ButtonLink href="#how-it-works" variant="ghost" size="lg">
                  Learn the flow
                </ButtonLink>
              </div>
              <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Capture registrations even without payment.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Status-led tracking: success, pending, failed.
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                No forced payments. Clear status tracking for success, pending,
                and failed donations.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Live overview
                </h3>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Active
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  ['Registrations captured', '100%'],
                  ['Payment transparency', 'Always verified'],
                  ['Admin reporting', 'Real-time'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="about" className="py-16">
          <Container className="space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold text-white">
                Designed for responsible NGO campaigns
              </h2>
              <p className="text-slate-300">
                Capture supporter data independently from donations, and give
                admins a single source of truth for registrations and payments.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                title="Reliable registrations"
                description="Save every supporter profile immediately, even when payment fails or is delayed."
                icon="REG"
              />
              <FeatureCard
                title="Verified donation tracking"
                description="Track attempts with clear status labels: success, pending, or failed."
                icon="PAY"
              />
              <FeatureCard
                title="Role-based access"
                description="Admins get insights and exports; users see their own registration and donation history."
                icon="ACL"
              />
            </div>
          </Container>
        </section>

        <section id="how-it-works" className="py-16">
          <Container className="space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold text-white">
                Simple flow, complete visibility
              </h2>
              <p className="text-slate-300">
                A two-stage journey keeps the process ethical and auditable for
                everyone.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">
                  1. Register first
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Supporters create an account, and their details are stored
                  instantly. Admins see every registration in the dashboard.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">
                  2. Donate with confidence
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Donations are optional. Each attempt is logged with status
                  and timestamps so reporting stays accurate.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section id="impact" className="py-16">
          <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-semibold text-white">
                Impact insights for every stakeholder
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                Give admins real-time dashboards and let users track their own
                contribution journeys without friction.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ['Registrations', 'Verified profiles ready to engage'],
                  ['Donations', 'Clean, auditable transaction history'],
                  ['Exports', 'CSV-ready compliance reports'],
                  ['Supporters', 'Clear updates and status tracking'],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-2 text-xs text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <h3 className="text-2xl font-semibold text-white">
                Built for transparency, trusted by donors
              </h3>
              <p className="text-slate-300">
                Every action is visible: from registration to payment outcome.
                That means more trust for donors and clearer reporting for your
                organization.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Audit-ready logs', 'Role-based dashboards', 'Exportable data'].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </Container>
        </section>

        <section id="donations" className="py-16">
          <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <h2 className="text-3xl font-semibold text-white">
                Ethical payment handling by design
              </h2>
              <p className="text-slate-300">
                Payments are never marked successful without confirmation from
                the gateway. Pending and failed attempts stay visible.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  'Independent registration storage',
                  'Verified payment success only',
                  'Full donation history for users',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-xl">
              <h3 className="text-xl font-semibold">
                Ready to support a campaign?
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Create a profile and choose when to donate.
              </p>
              <div className="mt-6">
                <ButtonLink
                  href={cta.href}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  {cta.label}
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}