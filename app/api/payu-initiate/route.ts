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

    // Generate hash (PayU SHA-512 format for v1)
    const hashString = `${merchantKey}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();

    const payuParams = {
      key: merchantKey,
      hash,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${req.headers.get('origin')}/dashboard?payment=success&donationId=${donationId}&txnid=${txnid}`,
      furl: `${req.headers.get('origin')}/dashboard?payment=failed&donationId=${donationId}&txnid=${txnid}`,
      // Optional: notifyurl for webhook
      // notifyurl: 'https://your-ngrok-url/api/payu-webhook',
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