import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Stripe configuration from server side
    const stripeConfig = {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      priceId: process.env.PRICE_ID,
    };

    // Validate configuration
    const validation = {
      configured: !!(stripeConfig.publishableKey && stripeConfig.publishableKey !== 'pk_test_placeholder'),
      missing: [] as string[],
    };

    if (!stripeConfig.publishableKey) {
      validation.missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    } else if (stripeConfig.publishableKey === 'pk_test_placeholder') {
      validation.missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (using placeholder)');
    }

    if (!stripeConfig.priceId) {
      validation.missing.push('PRICE_ID');
    }

    return NextResponse.json({
      stripeConfig,
      validation,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stripe config error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe configuration' },
      { status: 500 }
    );
  }
}
