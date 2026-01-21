'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EmailVerificationNotification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check for verification success from URL query params
    const verified = searchParams.get('verified');
    const code = searchParams.get('code'); // Supabase adds this during email confirmation
    
    // Show notification if verified param is present OR if code is present (email confirmation)
    if (verified === 'true' || code) {
      setShowNotification(true);
      
      // Show alert
      alert('Email verified successfully! Please login to continue.');
      
      // Clean up URL - remove both verified and code params
      window.history.replaceState({}, document.title, '/');
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    }
  }, [router, searchParams]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-200">Email verified successfully!</p>
            <p className="text-xs text-emerald-300/80">Redirecting to login...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
