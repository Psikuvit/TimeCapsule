'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/auth';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!isOpen || !user) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user.name,
      email: user.email,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      name: user.name,
      email: user.email,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      onClose();
    } catch (error) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* User Avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {user.id}</p>
        </div>

        {/* Profile Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Authentication Status
            </label>
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
              <span className="inline-flex items-center text-green-800 dark:text-green-200">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
