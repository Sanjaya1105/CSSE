import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from './Doctor/DoctorForm';
import DoctorTable from './Doctor/DoctorTable';
import ScheduleGrid from './Doctor/ScheduleGrid';
import AdminAppointmentTable from './AdminAppointment/AdminAppointmentTable';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Doctor CRUD state
  const initialForm = { doctorId: '', doctorName: '', roomNo: '', specialization: '', bookingDay: 'Monday', startTime: '', endTime: '' };
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
      specialization: form.specialization,
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
      specialization: doctor.specialization || '',
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
            <DoctorForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onClose={() => { setShowForm(false); setEditId(null); }}
              editId={editId}
            />
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
            <ScheduleGrid filteredDoctors={filteredDoctors} />
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">All Doctor Bookings</h3>
            <DoctorTable doctors={doctors} onEdit={handleEdit} onDelete={handleDelete} />
          </div>

          {/* Appointment Details Table */}
          <AdminAppointmentTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
