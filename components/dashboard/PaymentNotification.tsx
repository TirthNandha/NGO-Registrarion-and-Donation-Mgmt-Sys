'use client';

/**
 * Client component to handle payment success/failure notifications
 */

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const payment = searchParams.get('payment');
    
    if (payment) {
      // Show alert based on payment status
      if (payment === 'success') {
        alert('Payment SUCCESSFUL! Your donation has been recorded. Thank you for your contribution!');
      } else if (payment === 'failed') {
        alert('Payment FAILED! Your donation could not be processed. Please try again.');
      }
      
      // Clean up the URL by removing the query parameter
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}
