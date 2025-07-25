'use client';

import { useState } from 'react';
import { createCapsule, saveCapsule } from '@/utils/capsule';

interface CreateCapsuleProps {
  onCapsuleCreated: () => void;
}

export default function CreateCapsule({ onCapsuleCreated }: CreateCapsuleProps) {
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    
    try {
      const capsule = createCapsule(message, unlockDate);
      saveCapsule(capsule);
      
      setMessage('');
      setUnlockDate('');
      onCapsuleCreated();
    } catch (error) {
      console.error('Error creating capsule:', error);
      alert('Failed to create capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (current date + 1 minute)
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Create Time Capsule
      </h2>
      
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
    </div>
  );
} 