import { redirect } from 'next/navigation';
import AuthForm from '@/app/auth/AuthForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
  return <AuthForm />;
}