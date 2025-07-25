'use client';

import { useState, useEffect } from 'react';
import { TimeCapsule } from '@/types/capsule';
import { getAllCapsules, getCapsuleStatus, formatTimeRemaining, deleteCapsule } from '@/utils/capsule';

export default function CapsuleList() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const loadCapsules = () => {
      const allCapsules = getAllCapsules();
      setCapsules(allCapsules.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    };

    loadCapsules();
    
    // Update every minute to refresh countdowns
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [forceUpdate]);

  const handleRefresh = () => {
    setForceUpdate(prev => prev + 1);
  };

  const handleDeleteCapsule = (capsuleId: string) => {
    if (window.confirm('Are you sure you want to delete this time capsule? This action cannot be undone.')) {
      deleteCapsule(capsuleId);
      setForceUpdate(prev => prev + 1);
    }
  };

  if (capsules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          No time capsules yet
        </div>
        <p className="text-gray-400 dark:text-gray-500">
          Create your first time capsule to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Time Capsules
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {capsules.map((capsule) => {
          const status = getCapsuleStatus(capsule);
          const timeRemaining = formatTimeRemaining(status);
          
          return (
            <div
              key={capsule.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                status.isUnlocked 
                  ? 'border-green-500' 
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.isUnlocked
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {status.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {capsule.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCapsule(capsule.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete capsule"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Unlocks: {capsule.unlockDate.toLocaleString()}
                  </div>
                  
                  {status.isUnlocked ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                        {capsule.message}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4">
                      <div className="text-yellow-800 dark:text-yellow-200 font-medium">
                        🔒 This capsule will open in {timeRemaining}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 