
import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        // Handle error
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Loading admin dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Site Stats</h2>
        <p>Total Users: {users.length}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <ul>
          {users.map((user: any) => (
            <li key={user.id} className="mb-2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium">{user.name}</span> <span className="text-gray-500">({user.email})</span>
                {user.isPremium && <span className="ml-2 text-yellow-600">Premium</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
