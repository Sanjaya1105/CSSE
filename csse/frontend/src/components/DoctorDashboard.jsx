import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorAppointmentTable from './DoctorDashboard/DoctorAppointmentTable';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'doctor') {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Hospital Management</h1>
          <div className="flex gap-3">
            <button
              onClick={handleViewPatient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              View Patient
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Doctor</h2>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Welcome, Dr. {user.name}!</h3>
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
              <div>
                <p className="font-semibold">Specialization:</p>
                <p>{user.specialization}</p>
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

