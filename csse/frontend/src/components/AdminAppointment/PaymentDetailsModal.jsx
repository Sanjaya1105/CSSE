import React, { useEffect, useState } from 'react';

const PaymentDetailsModal = ({ appointmentId, appointmentData, onClose }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/payment-details`);
        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'No payment information found');
        }
      } catch (err) {
        setError('Failed to load payment details');
        console.error('Error fetching payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [appointmentId]);

  const renderPaymentDetails = () => {
    if (loading) {
      return <div className="text-center py-4">Loading payment details...</div>;
    }

    if (error) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">⚠️ {error}</p>
        </div>
      );
    }

    if (!paymentDetails) return null;

    const { paymentType, paymentDetails: details } = paymentDetails;

    // Render based on payment type
    if (paymentType === 'card') {
      return (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              💳 Card Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Amount:</span>
                <p className="text-lg font-bold text-blue-600">${details.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Payment Status:</span>
                <p className="capitalize">{details.paymentStatus}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Payment Date:</span>
                <p>{new Date(details.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
            🔒 Card details are encrypted and not displayed for security reasons
          </div>
        </div>
      );
    }

    if (paymentType === 'government') {
      return (
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              🏛️ Government Covered Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Coverage Type:</span>
                <p className="capitalize">{details.coverageType}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Payment Status:</span>
                <p className="capitalize">{details.paymentStatus}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Approval Reference:</span>
                <p className="font-mono text-blue-600">{details.approvalReferenceNumber || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Approved Date:</span>
                <p>{new Date(details.approvedDate).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded text-sm text-green-700">
            ✅ 100% Covered by Government Program
          </div>
        </div>
      );
    }

    if (paymentType === 'insurance') {
      const totalAmount = details.coveredAmount + details.coPaymentAmount;
      return (
        <div className="space-y-3">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              🏥 Insurance Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Insurance Provider:</span>
                <p className="text-lg font-bold text-yellow-700">{details.insuranceProvider}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Policy Number:</span>
                <p className="font-mono">{details.policyNumber}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Payment Status:</span>
                <p className="capitalize">{details.paymentStatus}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Claim Reference:</span>
                <p className="font-mono text-blue-600">{details.claimReferenceNumber || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded border border-yellow-300">
              <h5 className="font-semibold text-gray-700 mb-2">Payment Breakdown:</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Insurance Coverage:</span>
                  <span className="font-semibold">-${details.coveredAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Patient Co-Payment:</span>
                  <span className="font-semibold text-yellow-700">${details.coPaymentAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {details.processedDate && (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-gray-700">Processed Date:</span>
                <p>{new Date(details.processedDate).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Payment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Appointment Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">Appointment Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Patient:</span> {appointmentData.patientName}
              </div>
              <div>
                <span className="font-semibold">Age:</span> {appointmentData.age}
              </div>
              <div>
                <span className="font-semibold">Doctor:</span> {appointmentData.doctorName}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {appointmentData.date}
              </div>
              <div>
                <span className="font-semibold">Time:</span> {appointmentData.slotTime}
              </div>
              <div>
                <span className="font-semibold">Queue #:</span> {appointmentData.queueNumber}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {renderPaymentDetails()}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;

