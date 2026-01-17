// app/api/payu-initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { amount, donationId } = await req.json(); // amount in INR, donationId from Supabase

    // Get user from session (optional, for prefill)
    // For simplicity, assume you pass userName/userEmail from client

    const merchantKey = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;
    const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // Unique txnid
    const productinfo = `Donation_${donationId}`;
    const amountStr = amount.toFixed(2);
    const firstname = 'Test User'; // Replace with real from user profile
    const email = 'test@example.com'; // Replace with real
    const phone = '9999999999';

    // UDF fields (udf1 = donationId for tracking)
    const udf1 = donationId;
    const udf2 = '';
    const udf3 = '';
    const udf4 = '';
    const udf5 = '';

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Generate hash (PayU SHA-512 format)
    // Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${merchantKey}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex')
      .toLowerCase();
    const payuParams = {
      key: merchantKey,
      hash,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone: phone || '9999999999',
      surl: `${origin}/api/payment-callback?donationId=${donationId}&txnid=${txnid}`,
      furl: `${origin}/api/payment-callback?donationId=${donationId}&txnid=${txnid}`,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    };

    return NextResponse.json({
      payuUrl: 'https://test.payu.in/_payment',
      payuParams,
    });
  } catch (error) {
    console.error('PayU initiate error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}