import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeatureCard from '@/components/home/FeatureCard';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
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
    <div className="page">
      <Navbar cta={cta} />

      <main>
        <section className="hero">
          <Container className="hero-inner">
            <div className="hero-copy">
              <span className="badge">Registration-first, donation-ready</span>
              <h1>
                Build trust with transparent NGO registrations and ethical
                donations.
              </h1>
              <p className="hero-subtitle">
                Separate registration from payment flow so every supporter is
                captured, every donation attempt is tracked, and every report is
                accurate.
              </p>
              <div className="hero-actions">
                <ButtonLink href={cta.href} size="lg">
                  {cta.label}
                </ButtonLink>
                <ButtonLink href="#how-it-works" variant="ghost" size="lg">
                  Learn the flow
                </ButtonLink>
              </div>
              <div className="hero-note">
                No forced payments. Clear status tracking for success, pending,
                and failed donations.
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-header">Live overview</div>
              <div className="hero-card-body">
                <div>
                  <p className="stat-label">Registrations captured</p>
                  <p className="stat-value">100%</p>
                </div>
                <div>
                  <p className="stat-label">Payment transparency</p>
                  <p className="stat-value">Always verified</p>
                </div>
                <div>
                  <p className="stat-label">Admin reporting</p>
                  <p className="stat-value">Real-time</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="about" className="section">
          <Container>
            <div className="section-header">
              <h2>Designed for responsible NGO campaigns</h2>
              <p>
                Capture supporter data independently from donations, and give
                admins a single source of truth for registrations and payments.
              </p>
            </div>
            <div className="grid three">
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

        <section id="how-it-works" className="section muted-section">
          <Container>
            <div className="section-header">
              <h2>Simple flow, complete visibility</h2>
              <p>
                A two-stage journey keeps the process ethical and auditable for
                everyone.
              </p>
            </div>
            <div className="grid two">
              <div className="card">
                <h3 className="card-title">1. Register first</h3>
                <p className="card-body">
                  Supporters create an account, and their details are stored
                  instantly. Admins see every registration in the dashboard.
                </p>
              </div>
              <div className="card">
                <h3 className="card-title">2. Donate with confidence</h3>
                <p className="card-body">
                  Donations are optional. Each attempt is logged with status
                  and timestamps so reporting stays accurate.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section id="donations" className="section">
          <Container className="donation-section">
            <div>
              <h2>Ethical payment handling by design</h2>
              <p className="muted">
                Payments are never marked successful without confirmation from
                the gateway. Pending and failed attempts stay visible.
              </p>
              <ul className="checklist">
                <li>Independent registration storage</li>
                <li>Verified payment success only</li>
                <li>Full donation history for users</li>
              </ul>
            </div>
            <div className="cta-panel">
              <h3>Ready to support a campaign?</h3>
              <p>Create a profile and choose when to donate.</p>
              <ButtonLink href={cta.href} size="lg">
                {cta.label}
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}