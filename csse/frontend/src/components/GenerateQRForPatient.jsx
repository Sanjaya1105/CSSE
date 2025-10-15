import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const GenerateQRForPatient = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const printRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const response = await fetch(`http://localhost:5000/api/patient/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setSearchResults(data.data);
        setError('');
      } else {
        setSearchResults([]);
        setError('No patients found matching your search');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching for patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = (patient) => {
    setSelectedPatient(patient);
    
    // Trigger print after a short delay to ensure QR code is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleClosePrint = () => {
    setSelectedPatient(null);
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Generate QR Code for Patient</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 no-print">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Patient</h2>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter patient name or ID card number..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Search by patient name or ID card number
            </p>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-400">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Search Results ({searchResults.length} patient{searchResults.length > 1 ? 's' : ''} found)
              </h3>
              <div className="space-y-4">
                {searchResults.map((patient) => (
                  <div
                    key={patient._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-3">
                          {patient.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-blue-600">Email</p>
                            <p className="text-sm text-gray-800">{patient.email}</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-purple-600">Age</p>
                            <p className="text-sm text-gray-800">{patient.age} years</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-green-600">ID Card Number</p>
                            <p className="text-sm text-gray-800">{patient.idCardNumber}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerateQR(patient)}
                        className="ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-md"
                      >
                        Generate QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {!loading && searchResults.length === 0 && !error && searchTerm && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Preview - QR Code */}
      {selectedPatient && (
        <>
          {/* Overlay for screen view */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 no-print">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold"
                onClick={handleClosePrint}
                title="Close"
              >
                &times;
              </button>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">Print Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The print dialog will open automatically. You can preview and print the QR code below.
                </p>

                <div className="bg-gray-50 p-6 rounded-lg border-2 border-purple-200 mb-4">
                  <div className="flex justify-center mb-4">
                    <QRCodeSVG 
                      value={selectedPatient._id || selectedPatient.idCardNumber}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="text-left space-y-2">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-600">Patient Name</p>
                      <p className="text-lg text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-600">ID Card Number</p>
                      <p className="text-lg text-gray-900">{selectedPatient.idCardNumber}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-600">Patient ID</p>
                      <p className="text-sm font-mono text-gray-900">{selectedPatient._id}</p>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold w-full mb-2"
                  onClick={() => window.print()}
                >
                  Print QR Code
                </button>
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition font-semibold w-full"
                  onClick={handleClosePrint}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Print-only content */}
          <div ref={printRef} className="print-only">
            <div className="text-center p-8">
              <h1 className="text-3xl font-bold mb-6">Patient QR Code</h1>
              
              <div className="mb-6">
                <QRCodeSVG 
                  value={selectedPatient._id || selectedPatient.idCardNumber}
                  size={300}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-left max-w-md mx-auto space-y-3">
                <div className="border-b pb-2">
                  <p className="text-sm font-semibold text-gray-600">Patient Name</p>
                  <p className="text-xl font-bold text-gray-900">{selectedPatient.name}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm font-semibold text-gray-600">ID Card Number</p>
                  <p className="text-lg text-gray-900">{selectedPatient.idCardNumber}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm font-semibold text-gray-600">Age</p>
                  <p className="text-lg text-gray-900">{selectedPatient.age} years</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm font-semibold text-gray-600">Patient ID</p>
                  <p className="text-sm font-mono text-gray-900">{selectedPatient._id}</p>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p>Scan this QR code to access patient information</p>
                <p className="font-mono text-xs mt-2">QR Code Value: {selectedPatient._id || selectedPatient.idCardNumber}</p>
              </div>
            </div>
          </div>

          {/* Print Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-only,
              .print-only * {
                visibility: visible;
              }
              .print-only {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default GenerateQRForPatient;

