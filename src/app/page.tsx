'use client';

import { useState } from 'react';
import CreateCapsule from '@/components/CreateCapsule';
import CapsuleList from '@/components/CapsuleList';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCapsuleCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('view');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ⏰ TimeCapsule
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Send messages to your future self
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Create Capsule
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              View Capsules
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'create' ? (
            <CreateCapsule onCapsuleCreated={handleCapsuleCreated} />
          ) : (
            <CapsuleList key={refreshTrigger} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Your messages are stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
