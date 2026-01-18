import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { amount, donationId, firstname, email, phone } = await req.json();

    const merchantKey = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;
    const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const productinfo = `Donation_${donationId}`;
    const amountStr = amount.toFixed(2);

    const udf1 = donationId;
    const udf2 = '';
    const udf3 = '';
    const udf4 = '';
    const udf5 = '';

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
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