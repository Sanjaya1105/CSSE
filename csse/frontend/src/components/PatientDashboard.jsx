import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import AppointmentForm from './Appointment/AppointmentForm';
import AppointmentSlots from './Appointment/AppointmentSlots';
import AppointmentList from './Appointment/AppointmentList';
import AvailableDoctors from './Appointment/AvailableDoctors';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'patient') {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const [doctorBookings, setDoctorBookings] = useState([]);
  const [showDoctors, setShowDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [bookedCount, setBookedCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [nextWeekDate, setNextWeekDate] = useState('');
  const [showSlots, setShowSlots] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(data => setDoctorBookings(data));
    // Fetch patient appointments
    if (user && user.name) {
      fetch(`http://localhost:5000/api/appointments/patient?patientName=${encodeURIComponent(user.name)}`)
        .then(res => res.json())
        .then(data => setAppointments(data));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Hospital Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Patient</h2>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Welcome, {user.name}!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-semibold">Age:</p>
                <p>{user.age} years</p>
              </div>
              <div>
                <p className="font-semibold">ID Card Number:</p>
                <p>{user.idCardNumber}</p>
              </div>
            </div>

            {/* Generate QR Code Button */}
            <div className="mt-6">
              <button
                className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition font-semibold"
                onClick={() => setShowQRCode(true)}
              >
                Generate QR Code
              </button>
            </div>
            {/* Show Available Doctors Button */}
            <div className="mt-8">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition mb-4"
                onClick={() => setShowDoctors(!showDoctors)}
              >
                {showDoctors ? 'Hide Available Doctors' : 'Show Available Doctors'}
              </button>
              {showDoctors && (
                <AvailableDoctors doctors={doctorBookings} />
              )}
            </div>
            {/* Appointment Booking Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Book an Appointment</h3>
              <AppointmentForm
                doctors={doctorBookings}
                onBook={async (form) => {
                  setSelectedDoctor(form.doctorId);
                  setSelectedDate(form.date);
                  // Fetch available slots
                  const res = await fetch(`http://localhost:5000/api/appointments/slots?doctorId=${form.doctorId}&date=${form.date}`);
                  const data = await res.json();
                  setSlots(data.slots);
                  setBookedCount(data.bookedCount);
                  setMaxSlots(data.maxSlots);
                  // Calculate next week date
                  if (data.slots.length === 0) {
                    const d = new Date(form.date);
                    d.setDate(d.getDate() + 7);
                    setNextWeekDate(d.toISOString().slice(0,10));
                  } else {
                    setNextWeekDate('');
                  }
                  setShowSlots(true);
                }}
              />
              {showSlots && (
                <AppointmentSlots
                  slots={slots}
                  onSelect={async (slot, queueNumber) => {
                    // Book appointment
                    const doctor = doctorBookings.find(d => d._id === selectedDoctor);
                    const res = await fetch('http://localhost:5000/api/appointments/book', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        patientName: user.name,
                        age: user.age,
                        history: '',
                        doctorId: selectedDoctor,
                        doctorName: doctor.doctorName,
                        date: selectedDate,
                        slotTime: slot
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(`Appointment booked! Your number: ${queueNumber}, Time: ${slot}`);
                      setShowSlots(false);
                      // Refresh appointments
                      fetch(`http://localhost:5000/api/appointments/patient?patientName=${encodeURIComponent(user.name)}`)
                        .then(res => res.json())
                        .then(data => setAppointments(data));
                    } else {
                      alert(data.error || 'Booking failed');
                    }
                  }}
                  bookedCount={bookedCount}
                  maxSlots={maxSlots}
                  nextWeekDate={nextWeekDate}
                />
              )}
            </div>

            {/* Patient's Appointments List */}
            <AppointmentList appointments={appointments} />
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold"
              onClick={() => setShowQRCode(false)}
              title="Close"
            >
              &times;
            </button>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-purple-700 mb-4">Patient QR Code</h3>
              
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-purple-200 mb-4">
                <div className="flex justify-center mb-4">
                  <QRCodeSVG 
                    value={`http://localhost:5000/api/patient/${user._id || user.idCardNumber}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="text-left space-y-2">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">QR Code URL:</p>
                    <p className="text-xs font-mono text-gray-900 break-all">
                      POST http://localhost:5000/api/patient/{user._id || user.idCardNumber}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">Patient ID:</p>
                    <p className="text-lg font-mono text-gray-900">{user._id || user.idCardNumber}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">Name:</p>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">ID Card Number:</p>
                    <p className="text-lg text-gray-900">{user.idCardNumber}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to send a lookup request to the doctor's dashboard
              </p>

              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold w-full"
                onClick={() => setShowQRCode(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

