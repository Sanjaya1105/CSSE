import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Doctor CRUD state
  const initialForm = { doctorId: '', doctorName: '', roomNo: '', bookingDay: 'Monday', startTime: '', endTime: '' };
  const [doctors, setDoctors] = React.useState([]);
  const [searchRoom, setSearchRoom] = React.useState('');
  const [filteredDoctors, setFilteredDoctors] = React.useState([]);
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [editId, setEditId] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);

  // Fetch doctors
  React.useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setFilteredDoctors(data);
      });
  }, []);

  const handleSearchRoom = () => {
    if (!searchRoom.trim()) {
      setFilteredDoctors([]);
      setShowSchedule(false);
    } else {
      setFilteredDoctors(doctors.filter(doc => doc.roomNo === searchRoom.trim()));
      setShowSchedule(true);
    }
  };

  // Handle form change
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update doctor
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      doctorId: form.doctorId,
      doctorName: form.doctorName,
      roomNo: form.roomNo,
      bookingDay: form.bookingDay,
      startTime: form.startTime,
      endTime: form.endTime
    };
    if (editId) {
      await fetch(`/api/doctors/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    // Refresh list
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  };

  // Edit doctor
  const handleEdit = doctor => {
    setForm({
      doctorId: doctor.doctorId || '',
      doctorName: doctor.doctorName || '',
      roomNo: doctor.roomNo || '',
      bookingDay: doctor.bookingDay || 'Monday',
      startTime: doctor.startTime || '',
      endTime: doctor.endTime || ''
    });
    setEditId(doctor._id);
    setShowForm(true);
  };

  // Delete doctor
  const handleDelete = async id => {
    await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor Management</h2>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mb-6"
            onClick={() => { setShowForm(true); setForm(initialForm); setEditId(null); }}
          >
            Add Doctor
          </button>

          {/* Add/Edit Doctor Modal Card */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  title="Close"
                >
                  &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-blue-700">{editId ? 'Edit Doctor' : 'Add Doctor'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <input name="doctorId" value={form.doctorId} onChange={handleChange} placeholder="Doctor ID" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <input name="doctorName" value={form.doctorName} onChange={handleChange} placeholder="Doctor Name" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <input name="roomNo" value={form.roomNo} onChange={handleChange} placeholder="Room No" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <select name="bookingDay" value={form.bookingDay} onChange={handleChange} className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input name="startTime" value={form.startTime} onChange={handleChange} placeholder="Start Time (e.g. 09:00)" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <input name="endTime" value={form.endTime} onChange={handleChange} placeholder="End Time (e.g. 17:00)" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">{editId ? 'Update' : 'Add'} Doctor</button>
                </form>
              </div>
            </div>
          )}

          {/* Room Number Search */}
          <div className="mb-6 flex gap-2 items-center">
            <input
              type="text"
              value={searchRoom}
              onChange={e => setSearchRoom(e.target.value)}
              placeholder="Search Room Number"
              className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
              onClick={handleSearchRoom}
            >
              Search
            </button>
          </div>

          {/* Weekly Schedule Grid: Only show after clicking Search */}
          {showSchedule && (
            <div className="overflow-x-auto mb-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Weekly Doctor Schedule</h3>
              <table className="border w-full min-w-[700px] rounded-xl overflow-hidden shadow">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border px-2 py-2">Hour</th>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                      <th key={day} className="border px-2 py-2">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length: 12}, (_, i) => i+8).map(hour => {
                    const hourStr = hour.toString().padStart(2, '0') + ':00';
                    return (
                      <tr key={hourStr}>
                        <td className="border px-2 py-2 font-semibold bg-gray-50">{hourStr}</td>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
                          // Find doctor for this day and hour
                          const doc = filteredDoctors.find(d => {
                            if (d.bookingDay !== day) return false;
                            // Compare hour with startTime and endTime
                            const start = parseInt(d.startTime.split(':')[0], 10);
                            const end = parseInt(d.endTime.split(':')[0], 10);
                            return hour >= start && hour < end;
                          });
                          return (
                            <td
                              key={day+hourStr}
                              className={doc ? "border px-2 py-2 bg-red-500 text-white font-bold rounded-lg shadow" : "border px-2 py-2 bg-white"}
                            >
                              {doc ? (
                                <div>
                                  <span className="block text-sm">{doc.doctorName}</span>
                                  <span className="block text-xs">Room: {doc.roomNo}</span>
                                </div>
                              ) : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">All Doctor Bookings</h3>
            <table className="w-full border rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-2">Doctor ID</th>
                  <th className="border px-2 py-2">Doctor Name</th>
                  <th className="border px-2 py-2">Room No</th>
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
                    <td className="border px-2 py-2">{doc.bookingDay}</td>
                    <td className="border px-2 py-2">{doc.startTime}</td>
                    <td className="border px-2 py-2">{doc.endTime}</td>
                    <td className="border px-2 py-2">
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow mr-2 hover:bg-yellow-600 transition" onClick={() => handleEdit(doc)}>Edit</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded-lg shadow hover:bg-red-700 transition" onClick={() => handleDelete(doc._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
