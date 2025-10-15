import React from 'react';

const DoctorTable = ({ doctors, onEdit, onDelete }) => (
  <table className="w-full border rounded-xl overflow-hidden shadow">
    <thead>
      <tr className="bg-gray-200">
        <th className="border px-2 py-2">Doctor ID</th>
        <th className="border px-2 py-2">Doctor Name</th>
  <th className="border px-2 py-2">Room No</th>
  <th className="border px-2 py-2">Specialization</th>
        <th className="border px-2 py-2">Booking Day</th>
        <th className="border px-2 py-2">Start Time</th>
        <th className="border px-2 py-2">End Time</th>
        <th className="border px-2 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {doctors.map(doc => (
        <tr key={doc._id} className="hover:bg-blue-50">
          <td className="border px-2 py-2">{doc.doctorId}</td>
          <td className="border px-2 py-2 font-semibold text-blue-700">{doc.doctorName}</td>
          <td className="border px-2 py-2">{doc.roomNo}</td>
          <td className="border px-2 py-2">{doc.specialization}</td>
          <td className="border px-2 py-2">{doc.bookingDay}</td>
          <td className="border px-2 py-2">{doc.startTime}</td>
          <td className="border px-2 py-2">{doc.endTime}</td>
          <td className="border px-2 py-2">
            <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow mr-2 hover:bg-yellow-600 transition" onClick={() => onEdit(doc)}>Edit</button>
            <button className="bg-red-600 text-white px-3 py-1 rounded-lg shadow hover:bg-red-700 transition" onClick={() => onDelete(doc._id)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DoctorTable;
