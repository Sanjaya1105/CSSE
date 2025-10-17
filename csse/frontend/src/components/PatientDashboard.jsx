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
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-blue-600">Hospital Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-4xl font-bold text-gray-800">Patient</h2>
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-xl font-semibold text-gray-700">Welcome, {user.name}!</h3>
            <div className="grid grid-cols-1 gap-4 text-gray-600 md:grid-cols-2">
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                className="px-6 py-3 font-semibold text-white transition bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700"
                onClick={() => setShowQRCode(true)}
              >
                Generate QR Code
              </button>
              <button
                className="px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
                onClick={() => navigate('/my-medical-records')}
              >
                My Medical Records
              </button>
              <button
                className="px-6 py-3 font-semibold text-white transition bg-green-600 rounded-lg shadow-lg hover:bg-green-700"
                onClick={() => navigate('/my-appointments')}
              >
                My Appointments
              </button>
            </div>
            {/* Show Available Doctors Button */}
            <div className="mt-8">
              <button
                className="px-4 py-2 mb-4 text-white transition bg-blue-500 rounded-lg shadow hover:bg-blue-600"
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
              <h3 className="mb-4 text-xl font-semibold text-gray-700">Book an Appointment</h3>
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
                    const doctor = doctorBookings.find(d => d._id === selectedDoctor);

                    // Fetch doctor's channeling fee from the Doctor model using register number
                    let channelingFee = 50; // default fee
                    try {
                      // doctor.doctorId is the register number, not the ObjectId
                      const doctorRes = await fetch(`http://localhost:5000/api/doctors/register/${doctor.doctorId}`);
                      if (doctorRes.ok) {
                        const doctorData = await doctorRes.json();
                        channelingFee = doctorData.channelingFee || 50;
                      }
                    } catch (error) {
                      console.error('Error fetching channeling fee:', error);
                    }

                    const appointmentData = {
                      patientName: user.name,
                      age: user.age,
                      history: '',
                      doctorId: selectedDoctor,
                      doctorName: doctor.doctorName,
                      date: selectedDate,
                      slotTime: slot,
                      queueNumber,
                      channelingFee
                    };

                    // Navigate to payment method selection with appointment data
                    navigate('/payment-method-selection', {
                      state: { appointmentData, user }
                    });
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
          <div className="relative w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl animate-fade-in">
            <button
              className="absolute text-3xl font-bold text-gray-400 top-3 right-3 hover:text-gray-700"
              onClick={() => setShowQRCode(false)}
              title="Close"
            >
              &times;
            </button>
            
            <div className="text-center">
              <h3 className="mb-4 text-2xl font-bold text-purple-700">Patient QR Code</h3>
              
              <div className="p-6 mb-4 border-2 border-purple-200 rounded-lg bg-gray-50">
                <div className="flex justify-center mb-4">
                  <QRCodeSVG 
                    value={user._id || user.idCardNumber}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">QR Code Contains:</p>
                    <p className="font-mono text-xs text-gray-900 break-all">
                      Patient ID Only
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">Patient ID:</p>
                    <p className="font-mono text-lg text-gray-900">{user._id || user.idCardNumber}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">Name:</p>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-600">ID Card Number:</p>
                    <p className="text-lg text-gray-900">{user.idCardNumber}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="mb-2 text-sm text-gray-700">
                  <strong>📱 How to use this QR Code:</strong>
                </p>
                <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                  <li><strong>QR Code contains:</strong> Patient ID only (not a full URL)</li>
                  <li><strong>For Doctor:</strong> Scan and send to <code className="px-1 bg-gray-200 rounded">/api/patient/{'<scanned_id>'}</code></li>
                  <li><strong>For Admin:</strong> Scan and send to <code className="px-1 bg-gray-200 rounded">/api/patient/adminview/{'<scanned_id>'}</code></li>
                  <li className="font-semibold text-blue-700">The scanning system should append the ID to the appropriate endpoint</li>
                </ul>
              </div>

              <button
                className="w-full px-6 py-2 font-semibold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
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

