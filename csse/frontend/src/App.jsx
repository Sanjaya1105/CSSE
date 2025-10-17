import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import { PatientDashboard, MyMedicalRecords, MyAppointments } from './components/Patient'
import { DoctorDashboard, AddMedicalRecord } from './components/Doctor'
import { NurseDashboard } from './components/Staff'
import { SuperAdminDashboard, ViewAllUsers } from './components/SuperAdmin'
import { AdminDashboard } from './components/Admin'
import { PatientScanner, AdminPatientScanner, GenerateQRForPatient } from './components/QRGen'
import './App.css'
import { StaffTable } from './components/Staff';
import { PaymentMethodSelection, CardPayment, GovernmentPayment, InsurancePayment } from './components/Payment'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/patient-scanner" element={<PatientScanner />} />
          <Route path="/admin-patient-scanner" element={<AdminPatientScanner />} />
          <Route path="/add-medical-record" element={<AddMedicalRecord />} />
          <Route path="/my-medical-records" element={<MyMedicalRecords />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/generate-qr-for-patient" element={<GenerateQRForPatient />} />
          <Route path="/view-all-users" element={<ViewAllUsers />} />
          <Route path="/staff-management" element={<StaffTable />} />
          <Route path="/payment-method-selection" element={<PaymentMethodSelection />} />
          <Route path="/payment/card" element={<CardPayment />} />
          <Route path="/payment/government" element={<GovernmentPayment />} />
          <Route path="/payment/insurance" element={<InsurancePayment />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
