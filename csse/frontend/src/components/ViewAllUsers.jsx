import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewAllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const usersPerPage = 10;

  useEffect(() => {
    // Check if user is super admin
    const userType = localStorage.getItem('userType');
    if (userType !== 'superadmin') {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/superadmin/all-users?page=${currentPage}&limit=${usersPerPage}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalUsers(data.totalCount);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userType, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName} (${userType})?`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/superadmin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userType })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'User deleted successfully!', type: 'success' });
        fetchUsers(); // Refresh the list
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ text: data.message || 'Failed to delete user', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage({ text: 'Error deleting user. Please try again.', type: 'error' });
    }
  };

  const handleBack = () => {
    navigate('/superadmin-dashboard');
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getUserTypeColor = (userType) => {
    switch(userType) {
      case 'patient': return 'bg-blue-100 text-blue-700';
      case 'doctor': return 'bg-green-100 text-green-700';
      case 'staff': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">All Users</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">System Users</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {totalUsers} users | Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-400'
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
              <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold">#</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold">User Type</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold">Details</th>
                    <th className="px-6 py-3 border-b text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        {(currentPage - 1) * usersPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(user.userType)}`}>
                          {user.userType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.userType === 'patient' && (
                          <span>Age: {user.age}, ID: {user.idCardNumber}</span>
                        )}
                        {user.userType === 'doctor' && (
                          <span>
                            {user.specialization} | Reg: {user.registerNumber} | 
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                              user.status === 'approved' ? 'bg-green-100 text-green-700' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                          </span>
                        )}
                        {user.userType === 'staff' && (
                          <span>NIC: {user.nic}, Reg: {user.registerNumber}</span>
                        )}
                        {user.userType === 'admin' && (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.userType, user.name || user.email)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Users Message */}
          {!loading && !error && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
                {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllUsers;

