import Stripe from "stripe";
import CardPayment from "../models/Payments/CardPayment.js";
import GovernmentPayment from "../models/Payments/GovernmentCoveredPayment.js";
import InsurancePayment from "../models/Payments/InsurancePayment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =======================
// 1️⃣ CARD PAYMENT
// =======================
export const createCardPayment = async (req, res) => {
  try {
    const { userId, appointmentId, amount } = req.body;

    // 1. Create a Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    // 2. Save in your database
    const cardPayment = new CardPayment({
      userId,
      appointmentId,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "pending",
    });

    await cardPayment.save();

    // 3. Send client secret back to frontend
    res.status(201).json({
      message: "Card payment initialized successfully",
      clientSecret: paymentIntent.client_secret,
      cardPayment,
    });
  } catch (error) {
    console.error("Card payment creation failed:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 2️⃣ GOVERNMENT-COVERED PAYMENT
// =======================
export const createGovernmentPayment = async (req, res) => {
  try {
    const { userId, appointmentId, approvalReferenceNumber } = req.body;

    const governmentPayment = new GovernmentPayment({
      userId,
      appointmentId,
      approvalReferenceNumber,
      paymentStatus: "approved",
    });

    await governmentPayment.save();

    res.status(201).json({
      message: "Government-covered payment recorded successfully",
      governmentPayment,
    });
  } catch (error) {
    console.error("Government payment creation failed:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 3️⃣ INSURANCE PAYMENT
// =======================
export const createInsurancePayment = async (req, res) => {
  try {
    const {
      userId,
      appointmentId,
      insuranceProvider,
      policyNumber,
      claimReferenceNumber,
      coveredAmount,
      coPaymentAmount,
    } = req.body;

    const insurancePayment = new InsurancePayment({
      userId,
      appointmentId,
      insuranceProvider,
      policyNumber,
      claimReferenceNumber,
      coveredAmount,
      coPaymentAmount,
      paymentStatus: "pending",
    });

    await insurancePayment.save();

    res.status(201).json({
      message: "Insurance payment recorded successfully",
      insurancePayment,
    });
  } catch (error) {
    console.error("Insurance payment creation failed:", error);
    res.status(500).json({ error: error.message });
  }
};
