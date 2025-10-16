import React, { useEffect, useState } from 'react';
import PaymentDetailsModal from './PaymentDetailsModal';

const PendingAppointmentTable = () => {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchPendingAppointments = () => {
    fetch('http://localhost:5000/api/appointments/pending')
      .then(res => res.json())
      .then(data => setPendingAppointments(data))
      .catch(err => console.error('Error fetching pending appointments:', err));
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to approve this appointment?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Booked' })
      });

      if (response.ok) {
        alert('✅ Appointment approved successfully!');
        fetchPendingAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to approve appointment'));
      }
    } catch (err) {
      console.error('Error approving appointment:', err);
      alert('Error approving appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (response.ok) {
        alert('❌ Appointment cancelled successfully!');
        fetchPendingAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to cancel appointment'));
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Error cancelling appointment');
    } finally {
      setLoading(false);
    }
  };

  if (pendingAppointments.length === 0) {
    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
        <h3 className="text-lg font-semibold mb-2 text-green-800">
          ✅ No Pending Appointments
        </h3>
        <p className="text-gray-600">All appointments have been processed!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Pending Appointments ({pendingAppointments.length})
        </h3>
        <button
          onClick={fetchPendingAppointments}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ These appointments are awaiting approval. Review the payment method and approve or cancel as needed.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full border">
          <thead>
            <tr className="bg-yellow-100">
              <th className="border px-3 py-2 text-left">Queue #</th>
              <th className="border px-3 py-2 text-left">Patient Name</th>
              <th className="border px-3 py-2 text-left">Age</th>
              <th className="border px-3 py-2 text-left">Doctor</th>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Time</th>
              <th className="border px-3 py-2 text-left">Status</th>
              <th className="border px-3 py-2 text-center">Payment</th>
              <th className="border px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.map((appt, idx) => (
              <tr key={appt._id || idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{appt.queueNumber}</td>
                <td className="border px-3 py-2 font-semibold">{appt.patientName}</td>
                <td className="border px-3 py-2">{appt.age}</td>
                <td className="border px-3 py-2">{appt.doctorName}</td>
                <td className="border px-3 py-2">{appt.date}</td>
                <td className="border px-3 py-2">{appt.slotTime}</td>
                <td className="border px-3 py-2">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-semibold">
                    {appt.status}
                  </span>
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setShowPaymentModal(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-semibold"
                  >
                    💳 View Payment
                  </button>
                </td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleApprove(appt._id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400 text-sm font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(appt._id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400 text-sm font-semibold"
                    >
                      ✗ Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedAppointment && (
        <PaymentDetailsModal
          appointmentId={selectedAppointment._id}
          appointmentData={selectedAppointment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default PendingAppointmentTable;

