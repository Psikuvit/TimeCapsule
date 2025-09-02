'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setPaidStatus } from '@/utils/capsule';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Set user as paid
    setPaidStatus(true);
    
    // Redirect to home page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to TimeCapsule Premium! You now have unlimited access to create time capsules.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Premium Features Unlocked:
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <li>• Unlimited time capsules</li>
            <li>• Priority support</li>
            <li>• Advanced scheduling options</li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to home page in 3 seconds...
        </p>
        
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Go Home Now
        </button>
      </div>
    </div>
  );
}
