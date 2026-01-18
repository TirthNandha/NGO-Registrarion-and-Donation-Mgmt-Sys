import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! 
);

// Handle GET requests (for cancellations or failed payments)
export async function GET(req: NextRequest) {
  console.log('GET request to payment callback - likely cancellation or failed payment');
  
  const searchParams = req.nextUrl.searchParams;
  const donationId = searchParams.get('donationId');
  const txnid = searchParams.get('txnid');
  const mihpayid = searchParams.get('mihpayid'); // If PayU sends it

  console.log('DonationID:', donationId, 'TxnID:', txnid, 'MihpayID:', mihpayid);

  // If we have donationId from URL, mark it as failed
  if (donationId) {
    console.log('Marking donation as failed (GET request):', donationId);
    const { error } = await supabase
      .from('donations')
      .update({ 
        status: 'failed', 
        transaction_id: mihpayid || txnid || null, // Prefer PayU's ID if available
        txnid: txnid || null 
      })
      .eq('id', donationId);
    
    if (error) {
      console.error('Error updating donation:', error);
    } else {
      console.log('✅ Donation marked as failed');
    }
  }

  // Redirect to dashboard with failed status
  const redirectUrl = new URL('/dashboard', req.url);
  redirectUrl.searchParams.set('payment', 'failed');
  return NextResponse.redirect(redirectUrl, 302);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    const txnid = body.get('txnid') as string;
    const status = body.get('status') as string;
    const amount = body.get('amount') as string;
    const productinfo = body.get('productinfo') as string;
    const firstname = body.get('firstname') as string;
    const email = body.get('email') as string;
    const mihpayid = body.get('mihpayid') as string; // PayU's actual transaction ID
    const bank_ref_num = body.get('bank_ref_num') as string; // Bank reference number
    const udf1 = body.get('udf1') || '';
    const udf2 = body.get('udf2') || '';
    const udf3 = body.get('udf3') || '';
    const udf4 = body.get('udf4') || '';
    const udf5 = body.get('udf5') || '';
    const receivedHash = (body.get('hash') as string)?.toLowerCase();

    console.log('=== PayU Callback ===');
    console.log('Status:', status);
    console.log('Our TxnID:', txnid);
    console.log('PayU MihpayID:', mihpayid);
    console.log('Bank Ref:', bank_ref_num);

    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;

    const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const calculatedHash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex')
      .toLowerCase();

    console.log('Received hash:', receivedHash);
    console.log('Calculated hash:', calculatedHash);
    console.log('Hash string used:', hashString);

    if (receivedHash !== calculatedHash) {
      console.error('Hash mismatch - possible tampering or wrong key/salt');
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

   const donationId = body.get('udf1') as string;

    if (!donationId) {
      console.error('No donationId in callback');
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    let newStatus = 'failed';
    if (status === 'success') {
      newStatus = 'success';
    } else if (status === 'pending') {
      newStatus = 'pending';
    }

    console.log('Payment status from PayU:', status, '→ Updating to:', newStatus);
    console.log('DonationID:', donationId);
    console.log('Storing PayU Transaction ID:', mihpayid);

    const { error: updateError } = await supabase
      .from('donations')
      .update({ 
        status: newStatus, 
        transaction_id: mihpayid || bank_ref_num || txnid || null, // Use PayU's ID, fallback to bank ref or our txnid
        txnid: txnid || null // Keep our original txnid for reference
      })
      .eq('id', donationId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
    } else {
      console.log('✅ Donation updated successfully');
      console.log('Status:', newStatus);
      console.log('PayU Transaction ID:', mihpayid || 'N/A');
    }

    // Redirect to dashboard with status for alert
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('payment', newStatus);

    return NextResponse.redirect(redirectUrl, 302);
  } catch (err) {
    console.error('Callback error:', err);
    // Still redirect to dashboard even on error
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('payment', 'failed');
    redirectUrl.searchParams.set('error', 'callback_error');
    return NextResponse.redirect(redirectUrl, 302);
  }
}