import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'patient') {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const [doctorBookings, setDoctorBookings] = useState([]);

  useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctorBookings(data));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Hospital Management</h1>
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
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Patient</h2>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Welcome, {user.name}!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-semibold">Age:</p>
                <p>{user.age} years</p>
              </div>
              <div>
                <p className="font-semibold">ID Card Number:</p>
                <p>{user.idCardNumber}</p>
              </div>
            </div>
            {/* Doctor Booking Details */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Doctor Booking Details</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 py-1">Doctor Name</th>
                    <th className="border px-2 py-1">Room No</th>
                    <th className="border px-2 py-1">Day</th>
                    <th className="border px-2 py-1">Start Time</th>
                    <th className="border px-2 py-1">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorBookings.map(doc => (
                    <tr key={doc._id}>
                      <td className="border px-2 py-1">{doc.doctorName}</td>
                      <td className="border px-2 py-1">{doc.roomNo}</td>
                      <td className="border px-2 py-1">{doc.bookingDay}</td>
                      <td className="border px-2 py-1">{doc.startTime}</td>
                      <td className="border px-2 py-1">{doc.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

