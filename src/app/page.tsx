'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CreateCapsule from '@/components/CreateCapsule';
import CapsuleList from '@/components/CapsuleList';
import LoginModal from '@/components/LoginModal';
import UserProfile from '@/components/UserProfile';
import { getMessageCount, isPaidUser } from '@/utils/capsule';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    const updateCounts = async () => {
      const [count, paid] = await Promise.all([
        getMessageCount(),
        isPaidUser()
      ]);
      setMessageCount(count);
      setIsPaid(paid);
    };
    updateCounts();
  }, [refreshTrigger]);

  // Listen for capsule deletion events
  useEffect(() => {
    const handleCapsuleDeleted = async () => {
      const count = await getMessageCount();
      setMessageCount(count);
    };

    window.addEventListener('capsuleDeleted', handleCapsuleDeleted);
    
    return () => {
      window.removeEventListener('capsuleDeleted', handleCapsuleDeleted);
    };
  }, []);

  const handleCapsuleCreated = async () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('view');
    // Update message count after creating a capsule
    const count = await getMessageCount();
    setMessageCount(count);
  };

  const handleCapsuleDeleted = async () => {
    // Update message count after deleting a capsule
    const count = await getMessageCount();
    setMessageCount(count);
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/icon.svg" alt="Clock" className="w-16 h-16 text-blue-600 dark:text-blue-400 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              TimeCapsule
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Send messages to your future self
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 text-lg"
          >
            Get Started
          </button>
        </div>
        
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <img src="/icon.svg" alt="Clock" className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              TimeCapsule
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Send messages to your future self
          </p>
          
          {/* User Info and Status */}
          <div className="mt-4 flex justify-center items-center space-x-4">
            {/* User Avatar and Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Welcome, {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Messages: {isPaid ? `${messageCount}/∞` : `${messageCount}/10`}
                </span>
                {isPaid && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </span>
                )}
              </div>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserProfile(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-white dark:hover:bg-gray-800"
                title="User Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
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
            <CapsuleList key={refreshTrigger} onCapsuleDeleted={handleCapsuleDeleted} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Your messages are stored locally in your browser
          </p>
        </div>
      </div>
      
      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </div>
  );
}
