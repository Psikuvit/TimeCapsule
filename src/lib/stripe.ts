import Stripe from 'stripe';

// Use placeholder if not configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
});

export const FREE_MESSAGE_LIMIT = 10;
export const PRICE_ID = process.env.PRICE_ID || 'price_your_stripe_price_id_here';
