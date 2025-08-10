import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, songId, userId,organizationId } = body;

    // console.log('Request body:', body);
    // console.log(stripe)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Boost for Song ID: ${songId}`,
            },
            unit_amount: amount * 100, // Must be ≥ 50
          },
          quantity: 1,
        },
      ],
      metadata: {
        songId,
        userId,
        boostAmount: amount,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/boost-success?org_id=${organizationId}&user_id=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/boost-cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('❌ Stripe Checkout Session Error:', err); // ✅ log actual error object
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}