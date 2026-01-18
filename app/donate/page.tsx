'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Container from '@/components/ui/Container';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function DonatePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');

      // Step 1: Create pending donation record
      const { data: donation, error: insertError } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError || !donation) throw insertError || new Error('Failed to track donation');

      console.log("passing this Name: ", user.user_metadata?.name);
      console.log("passing this Email: ", user.email);
      // Step 2: Initiate PayU payment
      const initiateRes = await fetch('/api/payu-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donationId: donation.id,
          firstname: user.user_metadata?.name || 'User',
          email: user.email || 'user@example.com',
          phone: user.user_metadata?.phone_number || '9999999999',
        }),
      });

      if (!initiateRes.ok) {
        const errData = await initiateRes.json();
        throw new Error(errData.error || 'Failed to initiate payment');
      }

      const { payuUrl, payuParams } = await initiateRes.json();

      // Step 3: Auto-submit hidden form to redirect to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;

      Object.entries(payuParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit(); // This redirects to PayU checkout page
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader actions={<Button variant="ghost" onClick={() => router.back()}>Back</Button>} />

      <Container className="py-16 max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold mb-2">Make a Donation</h1>
          <p className="text-slate-400 mb-8">
            Your support means the world. Enter any amount you wish to contribute.
          </p>

          {error && <p className="text-rose-400 mb-6">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Donation Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 500"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || amount <= 0}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {loading ? 'Processing...' : 'Proceed to Pay Securely'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Powered by PayU • Secure & Encrypted
          </p>
        </div>
      </Container>

      <Footer />
    </div>
  );
}