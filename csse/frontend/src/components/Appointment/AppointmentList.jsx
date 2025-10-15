import React from 'react';

const AppointmentList = ({ appointments }) => (
  <div className="bg-white p-6 rounded-xl shadow mt-6">
    <h3 className="text-lg font-bold mb-4">Your Appointments</h3>
    <table className="w-full border rounded-xl">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-2">No.</th>
          <th className="border px-2 py-2">Doctor</th>
          <th className="border px-2 py-2">Date</th>
          <th className="border px-2 py-2">Time</th>
          <th className="border px-2 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appt, idx) => (
          <tr key={appt._id || idx}>
            <td className="border px-2 py-2">{appt.queueNumber}</td>
            <td className="border px-2 py-2">{appt.doctorName}</td>
            <td className="border px-2 py-2">{appt.date}</td>
            <td className="border px-2 py-2">{appt.slotTime}</td>
            <td className="border px-2 py-2">{appt.status || 'Booked'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AppointmentList;
