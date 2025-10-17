import React from 'react';
import StaffTable from './Staff/StaffTable';
import SuccessToast from './Staff/SuccessToast';
import { useNavigate } from 'react-router-dom';
import DoctorForm from './Doctor/DoctorForm';
import DoctorTable from './Doctor/DoctorTable';
import ScheduleGrid from './Doctor/ScheduleGrid';
import AdminAppointmentTable from './AdminAppointment/AdminAppointmentTable';
import PendingAppointmentTable from './AdminAppointment/PendingAppointmentTable';

import DoctorWeeklyReport from './Doctor/DoctorWeeklyReport';
import PeakTimesAnalytics from './PeakTimesAnalytics';

const AdminDashboard = () => {
  // Success notification state for staff schedule
  const [successMessage, setSuccessMessage] = React.useState('');
  const successTimeoutRef = React.useRef(null);

  // Show notification for a limited time
  const handleShowSuccess = (msg) => {
    setSuccessMessage(msg);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Manual close handler
  const handleCloseSuccess = () => {
    setSuccessMessage('');
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
  };
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
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
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
      setShowScheduleModal(false);
    } else {
      setFilteredDoctors(doctors.filter(doc => doc.roomNo === searchRoom.trim()));
      setShowSchedule(true);
      setShowScheduleModal(true);
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
      {/* Success notification toast for staff schedule */}
      <SuccessToast message={successMessage} onClose={handleCloseSuccess} />
      <nav className="bg-white shadow-md rounded-b-xl">
        <div className="flex flex-col items-center justify-between px-4 py-4 mx-auto max-w-7xl md:flex-row">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
              alt="Hospital"
              className="object-cover w-24 h-24 border-4 border-blue-200 shadow-lg rounded-2xl animate-fade-in"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
            <h1 className="text-3xl font-bold text-blue-600 drop-shadow-lg">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewPatients}
              className="px-4 py-2 font-semibold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              View Patients
            </button>
            <button
              onClick={handleGenerateQR}
              className="px-4 py-2 font-semibold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Generate QR for Patient
            </button>
            <button
              className="px-4 py-2 text-white transition bg-gray-600 rounded-lg hover:bg-gray-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col gap-8 px-4 py-8 mx-auto max-w-7xl">
        {/* Section 1: Doctor Booking Management */}
        <div className="p-8 bg-white border-l-8 border-blue-400 shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-blue-700">Doctor Booking Management</h2>
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Add Doctor Booking */}
            <div className="flex-1 p-6 mb-6 shadow bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-blue-600">Add Doctor Booking</h3>
              <button
                className="px-4 py-2 mb-4 text-white transition bg-green-500 rounded-lg shadow hover:bg-green-600"
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
            <div className="flex-1 p-6 mb-6 shadow bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-blue-600">All Doctor Bookings</h3>
              <button
                type="button"
                className="px-4 py-2 mb-4 text-white transition bg-blue-500 rounded-lg shadow hover:bg-blue-600"
                onClick={() => setShowDoctorTable((prev) => !prev)}
              >
                {showDoctorTable ? 'Hide Table' : 'Show Table'}
              </button>
              {showDoctorTable && (
                <DoctorTable doctors={doctors} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </div>
            {/* Room Search & Weekly Schedule */}
            <div className="flex-1 p-6 mb-6 shadow bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-blue-600">Room Search & Weekly Schedule</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={searchRoom}
                  onChange={e => setSearchRoom(e.target.value)}
                  placeholder="Search Room Number"
                  className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  className="px-4 py-2 text-white transition bg-blue-500 rounded-lg shadow hover:bg-blue-600"
                  onClick={handleSearchRoom}
                >
                  Search
                </button>
              </div>
              {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative animate-fade-in overflow-y-auto" style={{ maxHeight: '90vh' }}>
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                      onClick={() => setShowScheduleModal(false)}
                      title="Close"
                    >
                      &times;
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-blue-700">Weekly Doctor Schedule for Room {searchRoom}</h3>
                    <ScheduleGrid filteredDoctors={filteredDoctors} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Staff Management */}
        <div className="p-8 bg-white border-l-8 border-green-400 shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-green-700">Staff Management</h2>
          {/* Render StaffTable directly here, passing onShowSuccess */}
          <StaffTable onShowSuccess={() => handleShowSuccess('Staff schedule saved successfully!')} />
        </div>

        {/* Section 3: Appointment Management */}
        <div className="p-8 bg-white border-l-8 border-purple-400 shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-purple-700">Appointment Management</h2>
          
          {/* Pending Appointments Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-700 mb-4">Pending Appointments (Awaiting Approval)</h3>
            <PendingAppointmentTable />
          </div>

          {/* All Appointments Section */}
          <div>
            <h3 className="text-xl font-semibold text-purple-700 mb-4">All Appointments</h3>
            <AdminAppointmentTable />
          </div>
        </div>

        {/* Section 4: Doctor Weekly Report */}
        <div className="p-8 bg-white border-l-8 border-yellow-400 shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-yellow-700">Doctor Weekly Report</h2>
          <DoctorWeeklyReport />
        </div>
  </div>

  {/* Section 5: Patient Peak Times Analytics */}
  <PeakTimesAnalytics />
    </div>
  );
};

export default AdminDashboard;
