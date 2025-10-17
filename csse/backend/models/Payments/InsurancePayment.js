const mongoose = require('mongoose');

const insurancePaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  insuranceProvider: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
  },
  claimReferenceNumber: {
    type: String,
  },
  coveredAmount: {
    type: Number,
    required: true,
  },
  coPaymentAmount: {
    type: Number, // patient’s out-of-pocket portion, if any
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "processing"],
    default: "pending",
  },
  processedDate: {
    type: Date,
  },
});

const InsurancePayment = mongoose.model(
  "InsurancePayment",
  insurancePaymentSchema
);

module.exports = InsurancePayment;
