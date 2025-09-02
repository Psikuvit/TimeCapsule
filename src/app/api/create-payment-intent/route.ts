import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_ID } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { userId } = await request.json();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // $9.99 in cents
      currency: 'usd',
      metadata: {
        userId,
        product: 'timecapsule_premium',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent. Please check your Stripe configuration.' },
      { status: 500 }
    );
  }
}
