import React from 'react';

const DoctorAppointmentTable = ({ appointments, loading, error }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Appointments</h2>
      {loading ? (
        <p className="text-gray-500">Loading appointments...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-emerald-100">
              <tr>
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Patient Name</th>
                <th className="py-2 px-4 border-b">Age</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Queue No</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, idx) => (
                <tr key={appt._id} className="hover:bg-emerald-50">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{appt.patientName}</td>
                  <td className="py-2 px-4 border-b">{appt.age}</td>
                  <td className="py-2 px-4 border-b">{appt.date}</td>
                  <td className="py-2 px-4 border-b">{appt.slotTime}</td>
                  <td className="py-2 px-4 border-b">{appt.queueNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentTable;
