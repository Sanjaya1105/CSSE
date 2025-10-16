import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import NurseDashboard from './components/NurseDashboard'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import AdminDashboard from './components/AdminDashboard'
import PatientScanner from './components/PatientScanner'
import AdminPatientScanner from './components/AdminPatientScanner'
import AddMedicalRecord from './components/AddMedicalRecord'
import MyMedicalRecords from './components/MyMedicalRecords'
import GenerateQRForPatient from './components/GenerateQRForPatient'
import ViewAllUsers from './components/ViewAllUsers'
import './App.css'
import StaffTable from './components/Staff/StaffTable';
import PaymentMethodSelection from './components/PaymentMethodSelection'
import CardPayment from './components/Payment/CardPayment'
import GovernmentPayment from './components/Payment/GovernmentPayment'
import InsurancePayment from './components/Payment/InsurancePayment'

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
