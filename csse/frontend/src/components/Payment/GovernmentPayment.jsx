import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GovernmentPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentData, user } = location.state || {};

  const [formData, setFormData] = useState({
    approvalReferenceNumber: '',
    governmentId: '',
    coverageProgram: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Step 1: Create the appointment with 'Pending' status
      const appointmentRes = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!appointmentRes.ok) {
        throw new Error('Failed to create appointment');
      }

      const appointmentResponse = await appointmentRes.json();
      
      if (!appointmentResponse.success || !appointmentResponse.appointment) {
        throw new Error('Invalid appointment response');
      }

      // Step 2: Process government payment
      const paymentRes = await fetch('http://localhost:5000/api/payments/government', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          appointmentId: appointmentResponse.appointment._id,
          approvalReferenceNumber: formData.approvalReferenceNumber,
        })
      });

      if (!paymentRes.ok) {
        throw new Error('Payment processing failed');
      }

      const paymentData = await paymentRes.json();

      // Step 3: Update appointment to link payment (status remains 'Pending')
      const updateRes = await fetch(`http://localhost:5000/api/appointments/${appointmentResponse.appointment._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Pending',
          paymentType: 'government',
          paymentId: paymentData.governmentPayment._id
        })
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update appointment');
      }

      alert('Appointment submitted successfully! Pending admin approval for government coverage.');
      navigate('/patient-dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient-dashboard');
  };

  if (!appointmentData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-500">No appointment data found. Please book an appointment first.</p>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Government Covered Payment</h2>

          {/* Appointment Summary */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Appointment Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="font-semibold">Doctor:</p>
                <p>{appointmentData.doctorName}</p>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <p>{appointmentData.date}</p>
              </div>
              <div>
                <p className="font-semibold">Time:</p>
                <p>{appointmentData.slotTime}</p>
              </div>
              <div>
                <p className="font-semibold">Queue Number:</p>
                <p>{appointmentData.queueNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Total Amount:</p>
                <p className="text-lg text-gray-700">Rs.{(appointmentData.channelingFee || 50).toFixed(2)}</p>
              </div>
          
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Coverage Program *
              </label>
              <input
                type="text"
                name="coverageProgram"
                value={formData.coverageProgram}
                onChange={handleInputChange}
                required
                placeholder="e.g., Divi neguma"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Government ID Number *
              </label>
              <input
                type="text"
                name="governmentId"
                value={formData.governmentId}
                onChange={handleInputChange}
                required
                placeholder="Enter your government ID number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="approvalReferenceNumber"
                value={formData.approvalReferenceNumber}
                onChange={handleInputChange}
                placeholder="If you have a pre-approval reference"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {processing ? 'Processing...' : 'Submit for Approval'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              🏛️ Your information will be verified with the government database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentPayment;

