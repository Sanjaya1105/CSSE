import React, { useEffect, useState } from 'react';

const AdminAppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/appointments/patient?patientName=') // empty to get all
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  // Filter appointments by doctor name
  const filteredAppointments = searchDoctor.trim()
    ? appointments.filter(a => a.doctorName.toLowerCase().includes(searchDoctor.trim().toLowerCase()))
    : appointments;
  const displayedAppointments = expanded ? filteredAppointments : filteredAppointments.slice(0, 4);

  // Count booked and channeled appointments for searched doctor
  let bookedCount = 0;
  let channeledCount = 0;
  if (searchDoctor.trim()) {
    bookedCount = filteredAppointments.filter(a => (a.status || 'Booked').toLowerCase() === 'booked').length;
    channeledCount = filteredAppointments.filter(a => (a.status || '').toLowerCase() === 'channeled').length;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">All Appointments</h3>
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          value={searchDoctor}
          onChange={e => setSearchDoctor(e.target.value)}
          placeholder="Search Doctor Name"
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          onClick={() => setSearchDoctor(searchDoctor.trim())}
        >
          Search
        </button>
      </div>
      {searchDoctor.trim() && (
        <div className="mb-4 flex gap-4 items-center">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">Booked Count: {bookedCount}</span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">Channeled Count: {channeledCount}</span>
        </div>
      )}
      <table className="w-full border rounded-xl overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-2">No.</th>
            <th className="border px-2 py-2">Patient Name</th>
            <th className="border px-2 py-2">Age</th>
            <th className="border px-2 py-2">History</th>
            <th className="border px-2 py-2">Doctor</th>
            <th className="border px-2 py-2">Date</th>
            <th className="border px-2 py-2">Time</th>
            <th className="border px-2 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedAppointments.map((appt, idx) => (
            <tr key={appt._id || idx}>
              <td className="border px-2 py-2">{appt.queueNumber}</td>
              <td className="border px-2 py-2">{appt.patientName}</td>
              <td className="border px-2 py-2">{appt.age}</td>
              <td className="border px-2 py-2">{appt.history}</td>
              <td className="border px-2 py-2">{appt.doctorName}</td>
              <td className="border px-2 py-2">{appt.date}</td>
              <td className="border px-2 py-2">{appt.slotTime}</td>
              <td className="border px-2 py-2">{appt.status || 'Booked'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAppointments.length > 4 && (
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </div>
  );
};

export default AdminAppointmentTable;
