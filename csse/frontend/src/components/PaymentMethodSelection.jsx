import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentMethodSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentData, user } = location.state || {};

  if (!appointmentData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-500">No appointment data found. Please book an appointment first.</p>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Select Payment Method</h2>

          {/* Appointment Summary */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Appointment Details</h3>
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
                <p className="font-semibold">Channeling Fee:</p>
                <p className="text-2xl text-blue-600">Rs.{appointmentData.channelingFee?.toFixed(2) || '50.00'}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-center">
            Choose how you would like to pay for your appointment
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Payment */}
            <div
              onClick={() => navigate('/payment/card', { state: { appointmentData, user } })}
              className="cursor-pointer p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">Credit/Debit Card</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pay securely with your credit or debit card
                </p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Pay with Card
                </button>
              </div>
            </div>

            {/* Government Payment */}
            <div
              onClick={() => navigate('/payment/government', { state: { appointmentData, user } })}
              className="cursor-pointer p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-green-100"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Government Covered</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Use your government healthcare coverage
                </p>
                <button className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  Use Government Coverage
                </button>
              </div>
            </div>

            {/* Insurance Payment */}
            <div
              onClick={() => navigate('/payment/insurance', { state: { appointmentData, user } })}
              className="cursor-pointer p-6 border-2 border-yellow-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-yellow-100"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-yellow-700 mb-2">Health Insurance</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Submit a claim to your insurance provider
                </p>
                <button className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                  Use Insurance
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel & Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
