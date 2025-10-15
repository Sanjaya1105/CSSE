import React from 'react';

const AvailableDoctors = ({ doctors }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Doctors</h3>
    <table className="w-full border rounded-xl overflow-hidden shadow mb-6">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-2">Doctor Name</th>
          <th className="border px-2 py-2">Specialization</th>
          <th className="border px-2 py-2">Room No</th>
          <th className="border px-2 py-2">Day</th>
          <th className="border px-2 py-2">Start Time</th>
          <th className="border px-2 py-2">End Time</th>
        </tr>
      </thead>
      <tbody>
        {doctors.map(doc => (
          <tr key={doc._id}>
            <td className="border px-2 py-2 font-semibold text-blue-700">{doc.doctorName}</td>
            <td className="border px-2 py-2">{doc.specialization}</td>
            <td className="border px-2 py-2">{doc.roomNo}</td>
            <td className="border px-2 py-2">{doc.bookingDay}</td>
            <td className="border px-2 py-2">{doc.startTime}</td>
            <td className="border px-2 py-2">{doc.endTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AvailableDoctors;
