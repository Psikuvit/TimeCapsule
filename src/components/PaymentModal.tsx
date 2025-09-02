'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useMemo } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Do not initialize Stripe at module scope; wait until a real key is present

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Made optional since it's no longer used
}

function CheckoutForm({ onClose }: { onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setIsProcessing(false);
    }
    // Note: onSuccess is not called here because the user will be redirected to the payment success page
    // The payment success page will handle setting the paid status and redirecting back to home
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Pay $9.99'}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Check if Stripe is properly configured
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_placeholder';

  const stripePromise = useMemo(() => {
    if (!isStripeConfigured) return null;
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
  }, [isStripeConfigured]);

  useEffect(() => {
    if (isOpen && !clientSecret && isStripeConfigured) {
      createPaymentIntent();
    }
  }, [isOpen, clientSecret, isStripeConfigured]);

  // Reset client secret when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setStripeError(null);
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setStripeError(null);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user_' + Date.now(), // Simple user ID generation
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setStripeError(data.error || 'Failed to create payment intent');
        console.error('Failed to create payment intent:', data.error);
      }
    } catch (error) {
      setStripeError('Network error occurred');
      console.error('Error creating payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upgrade to Premium</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            You've reached the limit of 10 free messages. Upgrade to premium for unlimited messages!
          </p>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-blue-800 font-medium">Premium Features:</p>
            <ul className="text-blue-700 text-sm mt-1 space-y-1">
              <li>• Unlimited time capsules</li>
              <li>• Priority support</li>
              <li>• Advanced scheduling options</li>
            </ul>
          </div>
        </div>

        {!isStripeConfigured ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stripe Not Configured</h3>
            <p className="text-gray-600 mb-4">
              To enable payments, you need to set up your Stripe API keys. Please follow the setup instructions in the README.
            </p>
            <div className="bg-gray-50 p-3 rounded-md text-left text-sm">
              <p className="font-medium text-gray-700 mb-1">Required environment variables:</p>
              <code className="text-gray-600">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code><br/>
              <code className="text-gray-600">STRIPE_SECRET_KEY</code>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Setting up payment...</p>
          </div>
        ) : clientSecret && isStripeConfigured && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onClose={onClose} />
          </Elements>
        ) : (
          <div className="text-center py-8">
            {stripeError ? (
              <div className="mb-4">
                <p className="text-red-600 mb-2">Payment setup failed</p>
                <p className="text-sm text-gray-600">{stripeError}</p>
              </div>
            ) : (
              <p className="text-red-600">Failed to load payment form</p>
            )}
            <button
              onClick={createPaymentIntent}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
