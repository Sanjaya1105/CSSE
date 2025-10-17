import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'staff') {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    // Fetch nurse's schedule from backend
    if (user && user._id) {
      fetch(`/api/doctor-nurse-assignment?nurseId=${user._id}`)
        .then(res => res.json())
        .then(data => {
          setSchedule(Array.isArray(data) ? data : []);
        });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Hospital Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Nurse</h2>
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Welcome, {user.name}!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-semibold">NIC:</p>
                <p>{user.nic}</p>
              </div>
              <div>
                <p className="font-semibold">Register Number:</p>
                <p>{user.registerNumber}</p>
              </div>
            </div>
            {/* Nurse's schedule section */}
            <div className="mt-8">
              <h4 className="text-2xl font-bold text-blue-700 mb-4">Your Schedule</h4>
              {schedule.length === 0 ? (
                <p className="text-gray-500">No schedule found for you.</p>
              ) : (
                <table className="w-full text-md bg-blue-50 rounded-xl overflow-hidden shadow">
                  <thead className="bg-blue-200">
                    <tr>
                      <th className="p-3">Room</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Week Start</th>
                      <th className="p-3">Week End</th>
                      <th className="p-3">Time Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-blue-100 transition">
                        <td className="p-3">{item.roomNo}</td>
                        <td className="p-3">{item.doctorName}</td>
                        <td className="p-3">{item.weekStartDay}</td>
                        <td className="p-3">{item.weekEndDay}</td>
                        <td className="p-3">{item.timeSlot}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;

