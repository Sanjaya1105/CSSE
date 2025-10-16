import mongoose from "mongoose";

const cardPaymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
  },
  stripeCustomerId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cardPaymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const CardPayment = mongoose.model("CardPayment", cardPaymentSchema);

export default CardPayment;