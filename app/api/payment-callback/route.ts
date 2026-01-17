// app/api/payment-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service role key here
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData(); // PayU sends form-urlencoded data

    // Extract key fields from PayU POST body
    const txnid = body.get('txnid') as string;
    const status = body.get('status') as string;
    const amount = body.get('amount') as string;
    const productinfo = body.get('productinfo') as string;
    const firstname = body.get('firstname') as string;
    const email = body.get('email') as string;
    const udf1 = body.get('udf1') || '';
    const udf2 = body.get('udf2') || '';
    const udf3 = body.get('udf3') || '';
    const udf4 = body.get('udf4') || '';
    const udf5 = body.get('udf5') || '';
    const receivedHash = (body.get('hash') as string)?.toLowerCase();

    // Get your keys (test mode)
    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;

    // Build response hash string (IMPORTANT: order is salt first!)
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

    // Hash valid → process donation update
    // donationId must be passed as custom field in request (e.g., udf1 = donationId)
    const donationId = body.get('udf1') as string; // Use udf1 for donationId (change if you used different)

    if (!donationId) {
      console.error('No donationId in callback');
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const newStatus = status === 'success' ? 'success' : 'failed';

    const { error: updateError } = await supabase
      .from('donations')
      .update({ status: newStatus, transaction_id: txnid })
      .eq('id', donationId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
    }

    // Redirect to dashboard with status for alert
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('payment', newStatus);
    redirectUrl.searchParams.set('donationId', donationId);

    return NextResponse.redirect(redirectUrl, 302);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}