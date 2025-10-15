import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, Admin! You can manage your tasks here.</p>
      <button
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
      {/* Add more admin features here */}
    </div>
  );
};

export default AdminDashboard;
