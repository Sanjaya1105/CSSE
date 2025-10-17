import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PatientScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patientData, setPatientData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [isListening, setIsListening] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    diagnosis: '',
    recommendation: '',
    medicines: '',
    nextDate: ''
  });
  const [editReportFiles, setEditReportFiles] = useState([]);
  const pollingInterval = useRef(null);

  // Check if returning from medical record submission
  useEffect(() => {
    if (location.state?.returnToPatient && location.state?.patientData) {
      setPatientData(location.state.patientData);
      setIsListening(false);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Poll for pending patient requests
  useEffect(() => {
    const checkForPendingRequests = async () => {
      if (!isListening) return;

      try {
        const response = await fetch('http://localhost:5000/api/patient/pending/requests');
        const data = await response.json();

        if (data.success && data.requests && data.requests.length > 0) {
          // Get the first pending request
          const request = data.requests[0];
          setPendingRequest(request);
          setShowConfirmation(true);
          setIsListening(false); // Stop listening while showing alert
        }
        
        setLastChecked(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error checking for pending requests:', error);
      }
    };

    // Check immediately
    checkForPendingRequests();

    // Then check every 2 seconds
    pollingInterval.current = setInterval(checkForPendingRequests, 2000);

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isListening]);

  // Handle confirmation Yes
  const handleConfirmYes = async () => {
    if (pendingRequest) {
      setPatientData(pendingRequest.patientData);
      setShowConfirmation(false);
      
      // Clear this request from the backend queue
      try {
        await fetch(`http://localhost:5000/api/patient/pending/${pendingRequest.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing request:', error);
      }
      
      setPendingRequest(null);
    }
  };

  // Handle confirmation No
  const handleConfirmNo = async () => {
    if (pendingRequest) {
      // Clear this request from the backend queue
      try {
        await fetch(`http://localhost:5000/api/patient/pending/${pendingRequest.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing request:', error);
      }
    }
    
    setShowConfirmation(false);
    setPendingRequest(null);
    setIsListening(true); // Resume listening
  };

  // Handle back to dashboard
  const handleBack = () => {
    navigate('/doctor-dashboard');
  };

  // Clear patient data and resume listening
  const handleClear = () => {
    setPatientData(null);
    setIsListening(true);
    setShowMedicalRecords(false);
    setMedicalRecords([]);
  };

  // Load patient's medical records
  const handleViewMedicalRecords = async () => {
    if (!patientData || !patientData._id) return;
    
    setLoadingRecords(true);
    try {
      const response = await fetch(`http://localhost:5000/api/medical-records/patient/${patientData._id}`);
      const data = await response.json();
      
      if (data.success) {
        setMedicalRecords(data.data);
        setShowMedicalRecords(true);
      } else {
        alert('Failed to load medical records');
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      alert('Error loading medical records');
    } finally {
      setLoadingRecords(false);
    }
  };

  // Handle edit record
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setEditFormData({
      diagnosis: record.diagnosis || '',
      recommendation: record.recommendation || '',
      medicines: record.medicines || '',
      nextDate: record.nextDate || ''
    });
    setEditReportFiles([]);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({
      diagnosis: '',
      recommendation: '',
      medicines: '',
      nextDate: ''
    });
    setEditReportFiles([]);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit file change
  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    setEditReportFiles(prev => [...prev, ...validFiles]);
  };

  // Handle remove edit file
  const handleRemoveEditFile = (index) => {
    setEditReportFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle update record
  const handleUpdateRecord = async (e) => {
    e.preventDefault();

    if (!editFormData.diagnosis || !editFormData.medicines) {
      alert('Please fill in diagnosis and medicines');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('diagnosis', editFormData.diagnosis);
      submitData.append('recommendation', editFormData.recommendation);
      submitData.append('medicines', editFormData.medicines);
      submitData.append('nextDate', editFormData.nextDate);

      // Append files if any
      if (editReportFiles.length > 0) {
        editReportFiles.forEach(file => {
          submitData.append('reports', file);
        });
      }

      const response = await fetch(`http://localhost:5000/api/medical-records/${editingRecord._id}`, {
        method: 'PUT',
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Medical record updated successfully!');
        setEditingRecord(null);
        // Refresh medical records
        handleViewMedicalRecords();
      } else {
        alert(data.message || 'Failed to update medical record');
      }
    } catch (error) {
      console.error('Error updating medical record:', error);
      alert('Error updating medical record');
    }
  };

  // Handle delete record
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/medical-records/${recordId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Medical record deleted successfully!');
        // Refresh medical records
        handleViewMedicalRecords();
      } else {
        alert(data.message || 'Failed to delete medical record');
      }
    } catch (error) {
      console.error('Error deleting medical record:', error);
      alert('Error deleting medical record');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Patient Scanner</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening for requests...' : 'Not listening'}
              </span>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Scanner Section */}
        {!patientData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-blue-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Scan QR Code
              </h2>
              <p className="text-gray-600 mb-4">
                Waiting for patient lookup requests...
              </p>
              <div className="inline-block bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Status:</span> {isListening ? 'Ready to receive' : 'Processing request'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Last checked: {lastChecked}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                📱 Two Ways to Use:
              </h3>
              
              <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800 mb-2">Method 1: Scan QR Code (Recommended)</p>
                <p className="text-sm text-green-700">
                  Use a QR code scanner to scan the patient's QR code. 
                  The request will automatically appear here!
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Method 2: Manual via Postman</p>
                <ol className="text-left space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">1</span>
                    <span>Send <strong>POST</strong> or <strong>GET</strong> request to:<br />
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs mt-1 block">
                        http://localhost:5000/api/patient/{'<patient_id>'}
                      </code>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">2</span>
                    <span>Alert appears on this page</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">3</span>
                    <span>Click "Yes" to view patient details</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> This page automatically checks for new requests every 2 seconds. 
                Patient QR codes contain the complete API URL for instant scanning!
              </p>
            </div>
          </div>
        ) : (
          /* Patient Details Display */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Patient Details
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/add-medical-record', { state: { patientData } })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Add Medical Record
                </button>
                <button
                  onClick={handleViewMedicalRecords}
                  disabled={loadingRecords}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                >
                  {loadingRecords ? 'Loading...' : 'Past Medical Records'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Scan Another
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Patient Name
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {patientData.name}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-600 mb-1">
                  Email
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {patientData.email}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-600 mb-1">
                  Age
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {patientData.age} years
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-600 mb-1">
                  ID Card Number
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {patientData.idCardNumber}
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200 md:col-span-2">
                <p className="text-sm font-semibold text-pink-600 mb-1">
                  Address
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {patientData.address}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Patient ID
                </p>
                <p className="text-sm font-mono text-gray-900">
                  {patientData._id}
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-600 mb-1">
                  Registered On
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(patientData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && pendingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-bounce-in">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-blue-500 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🔔 New Patient Lookup Request
              </h3>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Patient Name:</span>{' '}
                  {pendingRequest.patientData.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">ID Card Number:</span>{' '}
                  {pendingRequest.patientData.idCardNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Age:</span>{' '}
                  {pendingRequest.patientData.age} years
                </p>
              </div>

              <p className="text-gray-700 mb-6 font-medium">
                Do you want to open this patient's details?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirmNo}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records Modal */}
      {showMedicalRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold"
              onClick={() => setShowMedicalRecords(false)}
              title="Close"
            >
              &times;
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Past Medical Records
              </h2>
              <p className="text-sm text-gray-600">
                Patient: <span className="font-semibold">{patientData?.name}</span>
              </p>
            </div>

            {medicalRecords.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">No medical records found for this patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record, index) => (
                  <div
                    key={record._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    {editingRecord && editingRecord._id === record._id ? (
                      /* Edit Form */
                      <form onSubmit={handleUpdateRecord} className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-blue-600">
                            Editing Record #{medicalRecords.length - index}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            Edit Mode
                          </span>
                        </div>

                        {/* Diagnosis */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis *</label>
                          <textarea
                            name="diagnosis"
                            value={editFormData.diagnosis}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="2"
                            required
                          />
                        </div>

                        {/* Medicines */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Medicines *</label>
                          <textarea
                            name="medicines"
                            value={editFormData.medicines}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="2"
                            required
                          />
                        </div>

                        {/* Recommendation */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Recommendation</label>
                          <textarea
                            name="recommendation"
                            value={editFormData.recommendation}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="2"
                          />
                        </div>

                        {/* Next Date */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Next Appointment Date</label>
                          <input
                            type="date"
                            name="nextDate"
                            value={editFormData.nextDate}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Add More Reports (PDF)</label>
                          <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleEditFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          {editReportFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {editReportFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                                  <span>{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditFile(idx)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Edit Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Update Record
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Mode */
                      <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Record #{medicalRecords.length - index}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          Age: {record.age}
                        </span>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-red-600 mb-1">Diagnosis</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{record.diagnosis}</p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-600 mb-1">Medicines</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{record.medicines}</p>
                      </div>

                      {record.recommendation && (
                        <div className="bg-purple-50 p-3 rounded-lg md:col-span-2">
                          <p className="text-sm font-semibold text-purple-600 mb-1">Recommendation</p>
                          <p className="text-gray-800 whitespace-pre-wrap">{record.recommendation}</p>
                        </div>
                      )}

                      {record.reportUrl && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-yellow-600 mb-1">
                            Report{record.reportUrl.includes(',') ? 's' : ''}
                          </p>
                          <div className="space-y-1">
                            {record.reportUrl.split(',').map((url, idx) => (
                              <a
                                key={idx}
                                href={`http://localhost:5000${url.trim()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {record.reportUrl.split(',').length > 1 ? `Report ${idx + 1}` : 'View Report PDF'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.nextDate && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-green-600 mb-1">Next Appointment</p>
                          <p className="text-gray-800 font-semibold">
                            {new Date(record.nextDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                    </>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMedicalRecords(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
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

export default PatientScanner;
