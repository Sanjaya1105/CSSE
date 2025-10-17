import React, { useState } from 'react';
import ChannelPopup from './ChannelPopup';

const DoctorAppointmentTable = ({ appointments, loading, error }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [doneChannels, setDoneChannels] = useState([]);

  // Guard against undefined/null and filter out already channeled
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  // Show all appointments, including channeled
  const filteredAppointments = safeAppointments;

  const handleChannelClick = (appt) => {
    setSelectedAppointment(appt);
  };

  const handleClosePopup = () => {
    setSelectedAppointment(null);
    setSaveError(null);
  };

  const handleSaveChannel = async (formData) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/channel/save', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      setSelectedAppointment(null);
      // Mark channel as done for this appointment
      setDoneChannels(prev => [...prev, formData.get('appointmentId')]);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Appointments</h2>
      {loading ? (
        <p className="text-gray-500">Loading appointments...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-emerald-100">
              <tr>
                <th className="py-2 px-4 border-b text-center">#</th>
                <th className="py-2 px-4 border-b text-left">Patient Name</th>
                <th className="py-2 px-4 border-b text-center">Age</th>
                <th className="py-2 px-4 border-b text-center">Date</th>
                <th className="py-2 px-4 border-b text-center">Time</th>
                <th className="py-2 px-4 border-b text-center">Queue No</th>
                <th className="py-2 px-4 border-b text-center">Status</th>
                <th className="py-2 px-4 border-b text-center">Channel</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt, idx) => (
                <tr key={appt._id} className="hover:bg-emerald-50">
                  <td className="py-2 px-4 border-b text-center">{idx + 1}</td>
                  <td className="py-2 px-4 border-b text-left">{appt.patientName}</td>
                  <td className="py-2 px-4 border-b text-center">{appt.age}</td>
                  <td className="py-2 px-4 border-b text-center">{appt.date}</td>
                  <td className="py-2 px-4 border-b text-center">{appt.slotTime}</td>
                  <td className="py-2 px-4 border-b text-center">{appt.queueNumber}</td>
                  <td className="py-2 px-4 border-b text-center">{appt.status || 'Pending'}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {appt.status === 'Channeled' || doneChannels.includes(appt._id) ? (
                      <button className="px-3 py-1 bg-gray-300 text-white rounded cursor-not-allowed" disabled>
                        Channeled
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                        onClick={() => handleChannelClick(appt)}
                      >
                        Channel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedAppointment && (
        <ChannelPopup
          appointment={selectedAppointment}
          onClose={handleClosePopup}
          onSave={handleSaveChannel}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
};

export default DoctorAppointmentTable;
