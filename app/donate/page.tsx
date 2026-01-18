import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Container from '@/components/ui/Container';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { ButtonLink } from '@/components/ui/Button';
import DonateForm from '@/components/donate/DonateForm';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function DonatePage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader 
        actions={
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Back to Dashboard
          </ButtonLink>
        } 
      />

      <Container className="py-16 max-w-2xl">
        <DonateForm />
      </Container>

      <Footer />
    </div>
  );
}
