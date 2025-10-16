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
  const [approvedDoctors, setApprovedDoctors] = React.useState([]);
  const [searchRoom, setSearchRoom] = React.useState('');
  const [filteredDoctors, setFilteredDoctors] = React.useState([]);
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [editId, setEditId] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [showDoctorTable, setShowDoctorTable] = React.useState(false);

  // Fetch doctors and approved doctor accounts
  React.useEffect(() => {
    // Fetch doctor bookings
    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setFilteredDoctors(data);
      });
    
    // Fetch approved doctor accounts
    fetch('http://localhost:5000/api/doctors/approved')
      .then(res => res.json())
      .then(data => {
        setApprovedDoctors(data);
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

  // Handle doctor selection from dropdown
  const handleDoctorSelect = (e) => {
    const selectedDoctorId = e.target.value;
    if (!selectedDoctorId) return;
    
    const selectedDoctor = approvedDoctors.find(doc => doc._id === selectedDoctorId);
    if (selectedDoctor) {
      setForm({
        ...form,
        doctorId: selectedDoctor.registerNumber,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization
      });
    }
  };

  // Staff management navigation
  const handleManageStaff = () => {
    navigate('/staff-management');
  }

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
      await fetch(`http://localhost:5000/api/doctors/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    // Refresh list
    fetch('http://localhost:5000/api/doctors')
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
    await fetch(`http://localhost:5000/api/doctors/${id}`, { method: 'DELETE' });
    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  };

  // Navigate to patient scanner
  const handleViewPatients = () => {
    navigate('/admin-patient-scanner');
  };

  // Navigate to QR generator
  const handleGenerateQR = () => {
    navigate('/generate-qr-for-patient');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
              alt="Hospital"
              className="w-24 h-24 object-cover rounded-2xl shadow-lg border-4 border-blue-200 animate-fade-in"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
            <h1 className="text-3xl font-bold text-blue-600 drop-shadow-lg">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewPatients}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              View Patients
            </button>
            <button
              onClick={handleGenerateQR}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Generate QR for Patient
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Section 1: Doctor Booking Management */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-400">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Doctor Booking Management</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Add Doctor Booking */}
            <div className="flex-1 bg-blue-50 rounded-xl p-6 shadow mb-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Add Doctor Booking</h3>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mb-4"
                onClick={() => { setShowForm(true); setForm(initialForm); setEditId(null); }}
              >
                Add Doctor Booking
              </button>
              {showForm && (
                <DoctorForm
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onClose={() => { setShowForm(false); setEditId(null); }}
                  editId={editId}
                  approvedDoctors={approvedDoctors}
                  onDoctorSelect={handleDoctorSelect}
                />
              )}
            </div>
            {/* All Doctor Bookings */}
            <div className="flex-1 bg-blue-50 rounded-xl p-6 shadow mb-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">All Doctor Bookings</h3>
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition mb-4"
                onClick={() => setShowDoctorTable((prev) => !prev)}
              >
                {showDoctorTable ? 'Hide Table' : 'Show Table'}
              </button>
              {showDoctorTable && (
                <DoctorTable doctors={doctors} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </div>
            {/* Room Search & Weekly Schedule */}
            <div className="flex-1 bg-blue-50 rounded-xl p-6 shadow mb-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Room Search & Weekly Schedule</h3>
              <div className="mb-4 flex gap-2 items-center">
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
              {showSchedule && (
                <ScheduleGrid filteredDoctors={filteredDoctors} />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Staff Management */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-400">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Staff Management</h2>
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
            onClick={handleManageStaff}
          >
            Manage Staff
          </button>
        </div>

        {/* Section 3: Appointment Management */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-purple-400">
          <h2 className="text-2xl font-bold text-purple-700 mb-6">Appointment Management</h2>
          <AdminAppointmentTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
