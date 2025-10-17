import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminAnalytics from './SuperAdminAnalytics';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [showAdminForm, setShowAdminForm] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [adminMsg, setAdminMsg] = React.useState('');
  const [adminList, setAdminList] = React.useState([]);
  const [pendingDoctors, setPendingDoctors] = React.useState([]);
  const [doctorMsg, setDoctorMsg] = React.useState('');
  const [showAnalytics, setShowAnalytics] = React.useState(false);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/superadmin/admins')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdminList(data.admins);
      });
    
    fetch('http://localhost:5000/api/superadmin/pending-doctors')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPendingDoctors(data.doctors);
      });
  }, [adminMsg, doctorMsg]); // refresh list after creating/deleting admin or approving/rejecting doctor

  const handleApproveDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(`Approve doctor ${doctorName}?`)) return;
    setDoctorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/superadmin/approve-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      const data = await res.json();
      if (data.success) {
        setDoctorMsg('Doctor approved successfully!');
      } else {
        setDoctorMsg(data.message || 'Approval failed');
      }
    } catch {
      setDoctorMsg('Server error. Try again.');
    }
  };

  const handleRejectDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(`Reject doctor ${doctorName}?`)) return;
    setDoctorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/superadmin/reject-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      const data = await res.json();
      if (data.success) {
        setDoctorMsg('Doctor rejected successfully!');
      } else {
        setDoctorMsg(data.message || 'Rejection failed');
      }
    } catch {
      setDoctorMsg('Server error. Try again.');
    }
  };

  const handleDeleteAdmin = async (email) => {
    if (!window.confirm(`Delete admin ${email}?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/superadmin/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setAdminMsg('Admin deleted successfully!');
      } else {
        setAdminMsg(data.message || 'Delete failed');
      }
    } catch {
      setAdminMsg('Server error. Try again.');
    }
  };
  const handleCreateAdminClick = () => setShowAdminForm(true);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/superadmin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setAdminMsg('Admin created successfully!');
        setShowAdminForm(false);
        setAdminEmail('');
        setAdminPassword('');
      } else {
        setAdminMsg(data.message || 'Admin creation failed');
      }
    } catch {
      setAdminMsg('Server error. Try again.');
    }
  };

  const handleResetClick = () => setShowForm(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleViewAllUsers = () => {
    navigate('/view-all-users');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
              alt="Hospital"
              className="w-24 h-24 object-cover rounded-2xl shadow-lg border-4 border-blue-200 animate-fade-in"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
            <h1 className="text-3xl font-bold text-blue-600 drop-shadow-lg">Super Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                showAnalytics 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? '📋 Dashboard View' : '📊 Analytical View'}
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              onClick={handleViewAllUsers}
            >
              View All Users
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              onClick={handleCreateAdminClick}
            >
              Create Admin
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              onClick={handleResetClick}
            >
              Reset Password
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Conditional Rendering: Analytics View or Regular Dashboard */}
        {showAnalytics ? (
          <SuperAdminAnalytics />
        ) : (
          <>
        {/* Section 1: Pending Doctor Accounts */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-400">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Pending Doctor Accounts</h2>
          {doctorMsg && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-400">
              {doctorMsg}
            </div>
          )}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">NIC</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">Specialization</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-semibold">Register Number</th>
                  <th className="px-6 py-3 border-b text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-gray-500 text-center py-6">
                      No pending doctor accounts.
                    </td>
                  </tr>
                ) : (
                  pendingDoctors.map((doctor, idx) => (
                    <tr key={doctor._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{doctor.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doctor.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doctor.nic}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doctor.specialization}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doctor.registerNumber}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
                            onClick={() => handleApproveDoctor(doctor._id, doctor.name)}
                          >
                            Accept
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                            onClick={() => handleRejectDoctor(doctor._id, doctor.name)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Admin Management */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-400">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Admins</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[300px] border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-gray-500 text-center py-2">No admins found.</td>
                  </tr>
                ) : (
                  adminList.map((admin, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 border text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border">{admin.email}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() => handleDeleteAdmin(admin.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {showAdminForm && (
            <form className="mt-4" onSubmit={handleAdminSubmit}>
              <label className="block mb-2 font-semibold">Admin Email:</label>
              <input
                type="email"
                className="border px-2 py-1 mb-2 w-64"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                required
              />
              <label className="block mb-2 font-semibold">Admin Password:</label>
              <input
                type="password"
                className="border px-2 py-1 mb-2 w-64"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="ml-2 px-4 py-1 bg-green-600 text-white rounded"
              >
                Create
              </button>
            </form>
          )}
          {adminMsg && <p className="mt-2 text-green-600">{adminMsg}</p>}
        </div>

        {/* Section 3: Password Reset */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-400">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Reset Password</h2>
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
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
