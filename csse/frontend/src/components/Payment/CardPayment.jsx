import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentData, user } = location.state || {};

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Step 1: Create the appointment
      console.log('Sending appointment data:', appointmentData);
      const appointmentRes = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!appointmentRes.ok) {
        const errorData = await appointmentRes.json();
        console.error('Appointment creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const appointmentResponse = await appointmentRes.json();
      
      if (!appointmentResponse.success || !appointmentResponse.appointment) {
        throw new Error('Invalid appointment response');
      }

      // Step 2: Process card payment
      const paymentRes = await fetch('http://localhost:5000/api/payments/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          appointmentId: appointmentResponse.appointment._id,
          amount: appointmentData.channelingFee || 50
        })
      });

      if (!paymentRes.ok) {
        throw new Error('Payment processing failed');
      }

      const paymentData = await paymentRes.json();

      if (paymentData.clientSecret) {
        alert('Appointment booked successfully! Payment processed.');
        navigate('/patient-dashboard');
      }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-500">No appointment data found. Please book an appointment first.</p>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">Card Payment</h2>

          {/* Appointment Summary */}
          <div className="p-6 mb-8 rounded-lg bg-blue-50">
            <h3 className="mb-4 text-xl font-semibold text-blue-800">Appointment Summary</h3>
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
                <p className="font-semibold">Amount:</p>
                <p className="text-2xl text-blue-600">${(appointmentData.channelingFee || 50).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Test Card Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-800 flex items-center">
                💳 Test Card Information
              </h4>
              <button
                type="button"
                onClick={() => {
                  setCardDetails({
                    cardholderName: 'John Doe',
                    cardNumber: '4242 4242 4242 4242',
                    expiryDate: '12/25',
                    cvv: '123'
                  });
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Auto-Fill Test Data
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Use these test card details for demo/testing purposes:
            </p>
            <div className="bg-white p-3 rounded border border-blue-100 text-sm">
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-semibold">Card Number:</span>
                  <p className="font-mono text-blue-600">4242 4242 4242 4242</p>
                </div>
                <div>
                  <span className="font-semibold">Expiry:</span>
                  <p className="font-mono text-blue-600">12/25</p>
                </div>
                <div>
                  <span className="font-semibold">CVV:</span>
                  <p className="font-mono text-blue-600">123</p>
                </div>
                <div>
                  <span className="font-semibold">Name:</span>
                  <p className="font-mono text-blue-600">Any Name</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Cardholder Name *
              </label>
              <input
                type="text"
                name="cardholderName"
                value={cardDetails.cardholderName}
                onChange={handleInputChange}
                required
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the name as it appears on your card
              </p>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                required
                placeholder="4242 4242 4242 4242"
                maxLength="19"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                16-digit number on the front of your card
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  required
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: MM/YY
                </p>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  required
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  3-4 digits on back
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Pay $${(appointmentData.channelingFee || 50).toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className="px-6 py-3 font-semibold text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-center text-gray-600">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="text-sm font-semibold text-yellow-800 mb-2">Accepted Cards:</h5>
              <div className="flex items-center gap-3 text-2xl">
                <span title="Visa">💳</span>
                <span title="Mastercard">💳</span>
                <span title="American Express">💳</span>
                <span title="Discover">💳</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                We accept Visa, Mastercard, American Express, and Discover
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPayment;

