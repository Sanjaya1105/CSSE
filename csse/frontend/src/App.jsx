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
import './App.css'

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
        </Routes>
      </div>
    </Router>
  )
}

export default App
