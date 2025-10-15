const DoctorBooking = require('../models/DoctorBooking');
const Doctor = require('../models/Doctor');

// Get all approved doctors (accounts)
exports.getApprovedDoctors = async (req, res) => {
  try {
    const approvedDoctors = await Doctor.find({ status: 'approved' }, '-password');
    res.json(approvedDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new doctor booking
exports.createDoctor = async (req, res) => {
  try {
  const { doctorId, doctorName, roomNo, specialization, bookingDay, startTime, endTime } = req.body;
  const doctorBooking = new DoctorBooking({ doctorId, doctorName, roomNo, specialization, bookingDay, startTime, endTime });
    await doctorBooking.save();
    res.status(201).json(doctorBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all doctor bookings
exports.getDoctors = async (req, res) => {
  try {
    const doctorBookings = await DoctorBooking.find();
    res.json(doctorBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a doctor booking
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
  const { doctorId, doctorName, roomNo, specialization, bookingDay, startTime, endTime } = req.body;
  const update = { doctorId, doctorName, roomNo, specialization, bookingDay, startTime, endTime };
    const doctorBooking = await DoctorBooking.findByIdAndUpdate(id, update, { new: true });
    res.json(doctorBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a doctor booking
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await DoctorBooking.findByIdAndDelete(id);
    res.json({ message: 'Doctor booking deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a doctor's channeling fee
exports.setChannelingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { channelingFee } = req.body;

    if (channelingFee == null || channelingFee < 0) {
      return res.status(400).json({ message: 'Invalid channeling fee' });
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { channelingFee }, { new: true });

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ message: 'Channeling fee updated', doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};