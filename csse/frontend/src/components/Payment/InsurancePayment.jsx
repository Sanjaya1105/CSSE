import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const InsurancePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentData, user } = location.state || {};

  const totalAmount = appointmentData?.channelingFee || 50;
  
  const [formData, setFormData] = useState({
    insuranceProvider: '',
    policyNumber: '',
    claimReferenceNumber: '',
    coveredAmount: totalAmount,
    coPaymentAmount: 0,
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
      // Step 1: Create the appointment
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

      // Step 2: Process insurance payment
      const paymentRes = await fetch('http://localhost:5000/api/payments/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          appointmentId: appointmentResponse.appointment._id,
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          claimReferenceNumber: formData.claimReferenceNumber,
          coveredAmount: parseFloat(formData.coveredAmount),
          coPaymentAmount: parseFloat(formData.coPaymentAmount),
        })
      });

      if (!paymentRes.ok) {
        throw new Error('Payment processing failed');
      }

      await paymentRes.json();
      alert('Appointment booked successfully! Insurance claim submitted.');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-500">No appointment data found. Please book an appointment first.</p>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const patientPayment = parseFloat(formData.coPaymentAmount) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Insurance Payment</h2>

          {/* Appointment Summary */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-800">Appointment Summary</h3>
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
                <p className="text-2xl text-yellow-600">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Insurance Provider *
              </label>
              <select
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Select your insurance provider</option>
                <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                <option value="Aetna">Aetna</option>
                <option value="Cigna">Cigna</option>
                <option value="UnitedHealthcare">UnitedHealthcare</option>
                <option value="Humana">Humana</option>
                <option value="Kaiser Permanente">Kaiser Permanente</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter your insurance policy number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Claim Reference Number
              </label>
              <input
                type="text"
                name="claimReferenceNumber"
                value={formData.claimReferenceNumber}
                onChange={handleInputChange}
                placeholder="Optional: Pre-authorization reference"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Insurance Covered Amount ($) *
                </label>
                <input
                  type="number"
                  name="coveredAmount"
                  value={formData.coveredAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Co-Payment Amount ($)
                </label>
                <input
                  type="number"
                  name="coPaymentAmount"
                  value={formData.coPaymentAmount}
                  onChange={handleInputChange}
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3">Payment Breakdown:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Consultation Fee:</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance Coverage:</span>
                  <span className="font-semibold text-green-600">-${parseFloat(formData.coveredAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Your Co-Payment:</span>
                  <span className="font-semibold text-yellow-700">${patientPayment.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Important Information:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Your claim will be submitted to your insurance provider</li>
                <li>Processing typically takes 3-5 business days</li>
                <li>You'll receive a confirmation email once processed</li>
                <li>Co-payment (if any) is due at the time of appointment</li>
              </ul>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {processing ? 'Processing...' : 'Submit Insurance Claim'}
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
              🏥 Your insurance information is handled securely and in compliance with HIPAA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurancePayment;


