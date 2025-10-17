import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AddMedicalRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData;

  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendation: '',
    medicines: '',
    nextDate: ''
  });
  const [reportFiles, setReportFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Redirect if no patient data
    if (!patientData) {
      navigate('/patient-scanner');
    }
  }, [patientData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = [];
    const validFiles = [];
    
    files.forEach(file => {
      // Validate PDF
      if (file.type !== 'application/pdf') {
        invalidFiles.push(`${file.name} (not a PDF)`);
        return;
      }
      // Validate size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (exceeds 10MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setMessage({ 
        text: `Invalid files: ${invalidFiles.join(', ')}. Only PDF files under 10MB are allowed.`, 
        type: 'error' 
      });
    } else {
      setMessage({ text: '', type: '' });
    }

    // Add valid files to existing files
    setReportFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setReportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate required fields
      if (!formData.diagnosis || !formData.medicines) {
        setMessage({ text: 'Please fill in all required fields', type: 'error' });
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('patientId', patientData._id);
      submitData.append('patientName', patientData.name);
      submitData.append('age', patientData.age);
      submitData.append('diagnosis', formData.diagnosis);
      submitData.append('recommendation', formData.recommendation);
      submitData.append('medicines', formData.medicines);
      submitData.append('nextDate', formData.nextDate);
      
      // Append all report files
      if (reportFiles.length > 0) {
        reportFiles.forEach((file, index) => {
          submitData.append('reports', file); // 'reports' for multiple files
        });
      }

      const response = await fetch('http://localhost:5000/api/medical-records/save', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ text: 'Medical record saved successfully!', type: 'success' });
        
        // Reset form
        setFormData({
          diagnosis: '',
          recommendation: '',
          medicines: '',
          nextDate: ''
        });
        setReportFiles([]);
        
        // Navigate back to patient scanner view after 1.5 seconds
        setTimeout(() => {
          navigate('/patient-scanner');
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Failed to save medical record', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient-scanner');
  };

  if (!patientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Add Medical Record</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Patient View
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Patient Information */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-blue-600">Patient Name</p>
                <p className="text-lg text-gray-900">{patientData.name}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-purple-600">Age</p>
                <p className="text-lg text-gray-900">{patientData.age} years</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-600">ID Card Number</p>
                <p className="text-lg text-gray-900">{patientData.idCardNumber}</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-400'
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Medical Record Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Medical Details</h3>

            {/* Age (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age <span className="text-gray-500 font-normal">(Auto-filled)</span>
              </label>
              <input
                type="number"
                value={patientData.age}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Enter diagnosis details..."
                rows="3"
                required
              />
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommendation
              </label>
              <textarea
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Enter recommendations (optional)..."
                rows="3"
              />
            </div>

            {/* Medicines */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medicines <span className="text-red-500">*</span>
              </label>
              <textarea
                name="medicines"
                value={formData.medicines}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Enter prescribed medicines..."
                rows="3"
                required
              />
            </div>

            {/* Report Upload - Multiple Files */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Medical Reports (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select one or more PDF files (max 10MB each)
              </p>
              
              {/* Display Selected Files */}
              {reportFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Selected Files ({reportFiles.length}):
                  </p>
                  {reportFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-800">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Next Appointment Date (If Needed)
              </label>
              <input
                type="date"
                name="nextDate"
                value={formData.nextDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? 'Saving...' : 'Submit Medical Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicalRecord;

