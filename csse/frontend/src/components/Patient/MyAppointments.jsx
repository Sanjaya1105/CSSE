import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/appointments/user/${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Error fetching appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId, status) => {
    if (status === 'Channeled') {
      alert('Cannot delete channeled appointments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Appointment deleted successfully');
        fetchAppointments();
      } else {
        alert(data.error || 'Failed to delete appointment');
      }
    } catch (err) {
      alert('Error deleting appointment: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Channeled':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">You don't have any appointments yet.</p>
              <button
                onClick={() => navigate('/patient-dashboard')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Book an Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Dr. {appointment.doctorName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-600">
                        <div>
                          <p className="text-sm font-semibold">Date</p>
                          <p>{appointment.date}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Time</p>
                          <p>{appointment.slotTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Queue Number</p>
                          <p>{appointment.queueNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Payment Type</p>
                          <p className="capitalize">{appointment.paymentType || 'N/A'}</p>
                        </div>
                      </div>

                      {appointment.history && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-600">Medical History</p>
                          <p className="text-gray-600">{appointment.history}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(appointment._id, appointment.status)}
                        disabled={appointment.status === 'Channeled'}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          appointment.status === 'Channeled'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;

