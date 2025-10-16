import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyMedicalRecords = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState([]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (!userData || userType !== 'patient') {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch patient's medical records
    const fetchMedicalRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/medical-records/patient/${parsedUser._id}`);
        const data = await response.json();

        if (data.success) {
          setMedicalRecords(data.data);
        } else {
          setError('Failed to load medical records');
        }
      } catch (err) {
        console.error('Error loading medical records:', err);
        setError('Error loading medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [navigate]);

  const handleBack = () => {
    navigate('/patient-dashboard');
  };

  const toggleRecord = (recordId) => {
    if (expandedRecords.includes(recordId)) {
      // Collapse the record
      setExpandedRecords(expandedRecords.filter(id => id !== recordId));
    } else {
      // Expand the record
      setExpandedRecords([...expandedRecords, recordId]);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">My Medical Records</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Patient Info */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Medical History
            </h2>
            <p className="text-gray-600">
              Patient: <span className="font-semibold">{user.name}</span> | 
              Age: <span className="font-semibold">{user.age} years</span> | 
              ID: <span className="font-semibold">{user.idCardNumber}</span>
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading medical records...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-400">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && medicalRecords.length === 0 && (
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
              <p className="text-gray-500 text-lg">No medical records found</p>
              <p className="text-gray-400 text-sm mt-2">
                Your medical records will appear here after doctor consultations
              </p>
            </div>
          )}

          {/* Medical Records List */}
          {!loading && !error && medicalRecords.length > 0 && (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <span className="font-semibold">Tip:</span> Click on any record to expand and view full details
                </p>
              </div>
              <div className="space-y-4">
              {medicalRecords.map((record, index) => {
                const isExpanded = expandedRecords.includes(record._id);
                
                return (
                  <div
                    key={record._id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => toggleRecord(record._id)}
                  >
                    {/* Record Header - Always Visible */}
                    <div className={`p-6 ${isExpanded ? 'bg-blue-50 border-b border-blue-200' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Record #{medicalRecords.length - index}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            Age: {record.age}
                          </span>
                          {/* Expand/Collapse Icon */}
                          <svg
                            className={`w-6 h-6 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Record Details - Only visible when expanded */}
                    {isExpanded && (
                      <div className="p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Diagnosis */}
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-sm font-semibold text-red-600 mb-2">
                              Diagnosis
                            </p>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {record.diagnosis}
                            </p>
                          </div>

                          {/* Medicines */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-blue-600 mb-2">
                              Prescribed Medicines
                            </p>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {record.medicines}
                            </p>
                          </div>

                          {/* Recommendation */}
                          {record.recommendation && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 md:col-span-2">
                              <p className="text-sm font-semibold text-purple-600 mb-2">
                                Doctor's Recommendation
                              </p>
                              <p className="text-gray-800 whitespace-pre-wrap">
                                {record.recommendation}
                              </p>
                            </div>
                          )}

                          {/* Report */}
                          {record.reportUrl && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <p className="text-sm font-semibold text-yellow-600 mb-2">
                                Medical Report
                              </p>
                              <a
                                href={`http://localhost:5000${record.reportUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Report PDF
                              </a>
                            </div>
                          )}

                          {/* Next Appointment */}
                          {record.nextDate && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <p className="text-sm font-semibold text-green-600 mb-2">
                                Next Appointment
                              </p>
                              <p className="text-lg font-bold text-gray-900">
                                {new Date(record.nextDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </>
          )}

          {/* Summary */}
          {!loading && !error && medicalRecords.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Total Medical Records:</span> {medicalRecords.length}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Last updated: {new Date(medicalRecords[0]?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMedicalRecords;

