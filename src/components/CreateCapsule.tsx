'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCapsule, canCreateMessage, getMessageCount, isPaidUser } from '@/utils/capsule';
import PaymentModal from './PaymentModal';

interface CreateCapsuleProps {
  onCapsuleCreated: () => void;
}

export default function CreateCapsule({ onCapsuleCreated }: CreateCapsuleProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  // Check if Stripe is configured
  const isStripeConfigured = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_placeholder';

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      const [count, paid] = await Promise.all([
        getMessageCount(),
        isPaidUser()
      ]);
      setMessageCount(count);
      setIsPaid(paid);
    };
    loadInitialState();
  }, []);

  // Check paid status when payment modal closes
  useEffect(() => {
    if (!showPaymentModal) {
      isPaidUser().then(setIsPaid);
    }
  }, [showPaymentModal]);

  // Update message count when it changes
  useEffect(() => {
    const updateMessageCount = async () => {
      const count = await getMessageCount();
      setMessageCount(count);
    };

    // Listen for custom capsule deletion events
    const handleCapsuleDeleted = () => {
      updateMessageCount();
    };

    window.addEventListener('capsuleDeleted', handleCapsuleDeleted);
    
    // Also update when component is focused (for same-tab updates)
    window.addEventListener('focus', updateMessageCount);
    
    return () => {
      window.removeEventListener('capsuleDeleted', handleCapsuleDeleted);
      window.removeEventListener('focus', updateMessageCount);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !unlockDate) {
      alert('Please fill in both message and unlock date');
      return;
    }

    const selectedDate = new Date(unlockDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      alert('Please select a future date and time');
      return;
    }

    // Check if user can create more messages
    const canCreate = await canCreateMessage();
    if (!canCreate) {
      if (isStripeConfigured) {
        setShowPaymentModal(true);
      } else {
        alert('You have reached the limit of 10 free messages. Please configure Stripe to enable premium upgrades.');
      }
      return;
    }

    await createCapsuleAndSave();
  };

  const createCapsuleAndSave = async () => {
    setIsSubmitting(true);
    
    try {
      const capsule = await createCapsule(message, unlockDate);
      if (capsule) {
        setMessage('');
        setUnlockDate('');
        const newCount = await getMessageCount();
        setMessageCount(newCount);
        onCapsuleCreated();
      } else {
        throw new Error('Failed to create capsule');
      }
    } catch (error) {
      console.error('Error creating capsule:', error);
      alert('Failed to create capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
  };

  // Get minimum date (current date + 1 minute)
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Create Time Capsule
      </h2>
      
      {/* User Welcome */}
      {user && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-200 dark:bg-blue-800 mr-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Welcome back, {user.name}!
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Ready to create your next time capsule?
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Message count indicator */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Messages created:</span>
          <span className={`font-medium ${messageCount >= 10 && !isPaid ? 'text-red-600' : 'text-green-600'}`}>
            {isPaid ? `${messageCount}/∞` : `${messageCount}/10`}
          </span>
        </div>
        {messageCount >= 10 && !isPaid && (
          <p className="text-xs text-red-600 mt-1">
            Upgrade to premium for unlimited messages
          </p>
        )}
        {isPaid && (
          <p className="text-xs text-green-600 mt-1">
            Premium user - unlimited messages
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message or code snippet here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            required
          />
        </div>
        
        <div>
          <label htmlFor="unlockDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unlock Date & Time
          </label>
          <input
            type="datetime-local"
            id="unlockDate"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            min={minDate}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isSubmitting ? 'Creating...' : 'Create Capsule'}
        </button>
      </form>
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
} 