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
  const [form, setForm] = React.useState(initialForm);
  const [editId, setEditId] = React.useState(null);

  // Fetch doctors
  React.useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

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
  };

  // Delete doctor
  const handleDelete = async id => {
    await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, Admin! You can manage your tasks here.</p>
      <button
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded"
        onClick={handleLogout}
      >
        Logout
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Doctor Management</h2>
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap">
          <input name="doctorId" value={form.doctorId} onChange={handleChange} placeholder="Doctor ID" required className="border px-2 py-1" />
          <input name="doctorName" value={form.doctorName} onChange={handleChange} placeholder="Doctor Name" required className="border px-2 py-1" />
          <input name="roomNo" value={form.roomNo} onChange={handleChange} placeholder="Room No" required className="border px-2 py-1" />
          <select name="bookingDay" value={form.bookingDay} onChange={handleChange} className="border px-2 py-1">
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input name="startTime" value={form.startTime} onChange={handleChange} placeholder="Start Time (e.g. 09:00)" required className="border px-2 py-1" />
          <input name="endTime" value={form.endTime} onChange={handleChange} placeholder="End Time (e.g. 17:00)" required className="border px-2 py-1" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">{editId ? 'Update' : 'Add'} Doctor</button>
        </form>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Doctor ID</th>
              <th className="border px-2 py-1">Doctor Name</th>
              <th className="border px-2 py-1">Room No</th>
              <th className="border px-2 py-1">Booking Day</th>
              <th className="border px-2 py-1">Start Time</th>
              <th className="border px-2 py-1">End Time</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doc => (
              <tr key={doc._id}>
                <td className="border px-2 py-1">{doc.doctorId}</td>
                <td className="border px-2 py-1">{doc.doctorName}</td>
                <td className="border px-2 py-1">{doc.roomNo}</td>
                <td className="border px-2 py-1">{doc.bookingDay}</td>
                <td className="border px-2 py-1">{doc.startTime}</td>
                <td className="border px-2 py-1">{doc.endTime}</td>
                <td className="border px-2 py-1">
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(doc)}>Edit</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(doc._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
