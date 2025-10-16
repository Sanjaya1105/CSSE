import mongoose from "mongoose";

const governmentPaymentSchema = new mongoose.Schema({
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
  coverageType: {
    type: String,
    default: "government",
  },
  approvalReferenceNumber: {
    type: String, // government authorization code, if applicable
  },
  paymentStatus: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "approved",
  },
  approvedDate: {
    type: Date,
    default: Date.now,
  },
});

const GovernmentPayment = mongoose.model(
  "GovernmentPayment",
  governmentPaymentSchema
);

export default GovernmentPayment;
