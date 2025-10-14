import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleResetClick = () => setShowForm(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/superadmin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Password reset successful!');
        setShowForm(false);
        setNewPassword('');
      } else {
        setMessage(data.message || 'Password reset failed');
      }
    } catch {
      setMessage('Server error. Try again.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>
      <p>Welcome, Super Admin! You have full access to the system.</p>
      <div className="flex gap-4 mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleResetClick}
        >
          Reset Password
        </button>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {showForm && (
        <form className="mt-4" onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">New Password:</label>
          <input
            type="password"
            className="border px-2 py-1 mb-2 w-64"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="ml-2 px-4 py-1 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </form>
      )}
      {message && <p className="mt-2 text-red-600">{message}</p>}
    </div>
  );
};

export default SuperAdminDashboard;
