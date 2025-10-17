import React from 'react';

const AppointmentList = ({ appointments }) => (
  <div className="bg-white p-6 rounded-xl shadow mt-6">
    <h3 className="text-lg font-bold mb-4">Your Appointments</h3>
    <table className="w-full border rounded-xl">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-2 text-center">No.</th>
          <th className="border px-2 py-2 text-left">Doctor</th>
          <th className="border px-2 py-2 text-center">Date</th>
          <th className="border px-2 py-2 text-center">Time</th>
          <th className="border px-2 py-2 text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appt, idx) => (
          <tr key={appt._id || idx}>
            <td className="border px-2 py-2 text-center">{appt.queueNumber}</td>
            <td className="border px-2 py-2 text-left">{appt.doctorName}</td>
            <td className="border px-2 py-2 text-center">{appt.date}</td>
            <td className="border px-2 py-2 text-center">{appt.slotTime}</td>
            <td className="border px-2 py-2 text-center">{appt.status || 'Booked'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AppointmentList;
