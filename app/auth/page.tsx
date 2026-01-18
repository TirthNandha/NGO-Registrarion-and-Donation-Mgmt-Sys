import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '@/app/auth/AuthForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Container from '@/components/ui/Container';
import Footer from '@/components/layout/Footer';

export default async function AuthPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    redirect(profile?.role === 'admin' ? '/admin' : '/dashboard');
  }

  // If not logged in → show the form
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80">
        <Container className="py-6">
          <Link href="/" className="block w-fit">
            <div className="text-base font-semibold text-white">Sahaay</div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Connecting Hearts, Securing Futures
            </div>
          </Link>
        </Container>
      </header>
      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-12">
        <AuthForm />
      </main>
      <Footer />
    </div>
  );
}