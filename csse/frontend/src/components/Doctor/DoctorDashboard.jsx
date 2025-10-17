import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorAppointmentTable from './DoctorAppointmentTable';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelingFee, setChannelingFee] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'doctor') {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setChannelingFee(parsedUser.channelingFee ?? '');

    // Fetch appointments for this doctor by register number
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/appointments/doctor?registerNumber=${parsedUser.registerNumber}`);
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleViewPatient = () => {
    navigate('/patient-scanner');
  };

  const handleUpdateFee = async () => {
    if (!channelingFee || channelingFee < 0) {
      alert('Please enter a valid channeling fee');
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/api/doctors/${user._id}/channeling-fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelingFee: Number(channelingFee) })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update fee');

      // Update local user and localStorage
      const updatedUser = { ...user, channelingFee: Number(channelingFee) };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Channeling fee updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-green-600">Hospital Management</h1>
          <div className="flex gap-3">
            <button
              onClick={handleViewPatient}
              className="px-4 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              View Patient
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="p-8 mb-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-4xl font-bold text-gray-800">Doctor</h2>
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-xl font-semibold text-gray-700">Welcome, Dr. {user.name}!</h3>
            <div className="grid grid-cols-1 gap-4 text-gray-600 md:grid-cols-2">
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
              <div>
                <p className="font-semibold">Specialization:</p>
                <p>{user.specialization}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold">Channeling Fee (LKR):</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={channelingFee}
                    onChange={(e) => setChannelingFee(e.target.value)}
                    className="w-32 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    onClick={handleUpdateFee}
                    disabled={updating}
                    className="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Fee'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DoctorAppointmentTable appointments={appointments} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default DoctorDashboard;

