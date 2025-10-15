import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientScanner = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [isListening, setIsListening] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());
  const pollingInterval = useRef(null);

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
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Scan Another
              </button>
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
    </div>
  );
};

export default PatientScanner;
